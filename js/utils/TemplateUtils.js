/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const XPath = require('xpath');
const Dom = require('xmldom').DOMParser;

const parse = require('wellknown');

const TemplateUtils = {

    NUMBER_TYPE: 1,
    STRING_TYPE: 2,
    BOOLEAN_TYPE: 3,
    OBJECT_TYPE: 4,
    ARRAY_TYPE: 5,
    GEOMETRY_TYPE: 6,

    nsResolver(wfsVersion="2.0") {
        switch (wfsVersion) {
            case "1.1.0": {
                return {
                    "wfs": "http://www.opengis.net/wfs",
                    "gml": "http://www.opengis.net/gml",
                    "sira": "http://www.regione.piemonte.it/ambiente/sira/1.0",
                    "ms": "http://mapserver.gis.umn.edu/mapserver"
                };
            }
            case "2.0": {
                return {
                    "wfs": "http://www.opengis.net/wfs/2.0",
                    "gml": "http://www.opengis.net/gml/3.2",
                    "sira": "http://www.regione.piemonte.it/ambiente/sira/1.0"
                };
            }
            default:
                return {
                    "wfs": "http://www.opengis.net/wfs",
                    "gml": "http://www.opengis.net/gml",
                    "sira": "http://www.regione.piemonte.it/ambiente/sira/1.0"
                };
        }
    },
    getModels(data, root, config, wfsVersion="2.0") {
        let doc = new Dom().parseFromString(data);

        let select = XPath.useNamespaces(this.nsResolver(wfsVersion));

        let rows = select(root, doc);
        return rows.map((row) => {
            return this.getModel(data, config, row, wfsVersion);
        });
    },
    getModel(data, config, el, wfsVersion="2.0") {
        let doc = el || new Dom().parseFromString(data);

        let model = {};
        for (let element in config) {
            if (config[element]) {
                model[config[element].field] = this.getElement(config[element], doc, wfsVersion);
            }
        }
        return model;
    },
    getElementValue(result, type, wfsVersion="2.0") {
        switch (type) {
            case 1 /*NUMBER_TYPE*/: {
                return parseFloat(result && result.nodeValue || '0');
            }
            case 2 /*STRING_TYPE*/: {
                return result && result.nodeValue || '';
            }
            case 3 /*BOOLEAN_TYPE*/: {
                return result && result.nodeValue === "true" || false;
            }
            case 6 /*GEOMETRY_TYPE*/: {
                let value;
                if (wfsVersion === "2.0") {
                    value = result && result.nodeValue || {};
                } else {
                    value = result && result.nodeValue && parse(result.nodeValue) || result && result.nodeValue || {};
                }
                return value;
            }
            default: return result.nodeValue || result;
        }
    },
    getElement(element, doc, wfsVersion="2.0") {
        let select = XPath.useNamespaces(this.nsResolver(wfsVersion));
        let value = "";
        let result;
        const me = this;

        if (!element.type) {
            let values = [];
            let results = select(element.xpath, doc);
            results.forEach((res) => {
                values.push(this.getElementValue(res));
            });
            value = values;
        }

        if (element.type === this.OBJECT_TYPE) {
            let values = [];
            let results = select(element.xpath, doc);
            results.forEach((res) => {
                value = {};
                element.fields.forEach((f) => {
                    let r = select(f.xpath, res)[0];
                    value[f.field] = (f.type === me.OBJECT_TYPE) ? me.getElement(f, res, wfsVersion) : this.getElementValue(r, f.type, wfsVersion);
                });
                values.push(value);
            });
            value = values;
        } else if (element.type === this.ARRAY_TYPE) {
            let values = [];
            let results = select(element.xpath, doc);
            results.forEach((res) => {
                if (element.fields) {
                    value = {};
                    element.fields.forEach((f) => {
                        let r = select(f.xpath, res);
                        r.forEach((v) => {
                            value[f.field] = (f.type === me.OBJECT_TYPE) ? me.getElement(f, v, wfsVersion) : this.getElementValue(v, f.type, wfsVersion);
                        });
                    });
                    values.push(value);
                } else {
                    values.push(this.getElementValue(res, element.type, wfsVersion));
                }
            });
            value = values;
        } else if (element.type === this.GEOMETRY_TYPE) {
            let results = select(element.xpath, doc);

            let values = [];
            for (let k = 0; k < results.length; k++) {
                result = results[k];

                value = this.getElementValue(result, element.type, wfsVersion);

                if (wfsVersion === "2.0" || !value.geometry) {
                    try {
                        let coords = value.split(" ");
                        let coordinates = [];

                        for (let j = 0; j < coords.length; j = j + 2) {
                            if (j + 1 <= coords.length) {
                                if (parseFloat(coords[j]) && parseFloat(coords[j + 1])) {
                                    coordinates.push([parseFloat(coords[j]), parseFloat(coords[j + 1])]);
                                }
                            }
                        }

                        value = {
                            type: "geometry",
                            coordinates: coordinates
                        };
                    } catch(e) {
                        value = value;
                    }
                }

                values.push(value);
            }

            if (values.length > 1) {
                let coordinates = [];
                for (let k = 0; k < values.length; k++) {
                    let coords = values[k].coordinates;
                    for (let l = 0; l < coords.length; l++) {
                        coordinates.push(coords[l]);
                    }
                }

                value = {
                    type: "geometry",
                    coordinates: coordinates
                };
            } else {
                value = values[0];
            }

        } else if (element.type === this.STRING_TYPE) {
            for (let i = 0; i < element.xpath.length; i++) {
                result = select(element.xpath[i], doc)[0];
                // if (element.type === this.STRING_TYPE) {
                if (i > 0) {
                    value += " ";
                }
                value += this.getElementValue(result, element.type, wfsVersion);
                /*} else {
                    value = this.getElementValue(result, element.type, wfsVersion);
                }*/
            }
        } else if (element.type === this.NUMBER_TYPE) {
            result = select(element.xpath, doc)[0];
            value = this.getElementValue(result, element.type, wfsVersion);
        }
        return value;
    },
    getValue(xml, element, wfsVersion="2.0") {
        let doc = new Dom().parseFromString(xml);
        let value;

        if (typeof element === "object") {
            value = this.getElement(element, doc, wfsVersion);
        } else {
            let select = XPath.useNamespaces(this.nsResolver(wfsVersion));
            let values = [];
            let results = select(element, doc);
            results.forEach((res) => {
                values.push(this.getElementValue(res));
            });
            value = values;
        }

        return value;
    }
};

module.exports = TemplateUtils;
