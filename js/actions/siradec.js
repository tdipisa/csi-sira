/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('../../MapStore2/web/client/libs/ajax');

const QUERYFORM_CONFIG_LOADED = 'QUERYFORM_CONFIG_LOADED';
const FEATURETYPE_CONFIG_LOADED = 'FEATURETYPE_CONFIG_LOADED';
const EXPAND_FILTER_PANEL = 'EXPAND_FILTER_PANEL';
const QUERYFORM_CONFIG_LOAD_ERROR = 'QUERYFORM_CONFIG_LOAD_ERROR';
const FEATUREGRID_CONFIG_LOADED = 'FEATUREGRID_CONFIG_LOADED';
const FEATUREINFO_CONFIG_LOADED = 'FEATUREINFO_CONFIG_LOADED';
const TOPOLOGY_CONFIG_LOADED = 'TOPOLOGY_CONFIG_LOADED';

const assign = require('object-assign');
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');

function configureFeatureType(ft, field) {
    return {
        type: FEATURETYPE_CONFIG_LOADED,
        ftName: ft.id,
        ftNameLabel: ft.name,
        geometryName: ft.geometryName,
        geometryType: ft.geometryType,
        field: field
    };
}

function configureQueryForm(config) {
    return {
        type: QUERYFORM_CONFIG_LOADED,
        config: config
    };
}

function configureFeatureGrid(config) {
    return {
        type: FEATUREGRID_CONFIG_LOADED,
        config: config
    };
}
function configureTopology(config) {
    return {
        type: TOPOLOGY_CONFIG_LOADED,
        config: config
    };
}

function configureFeatureInfo(config) {
    return {
        type: FEATUREINFO_CONFIG_LOADED,
        config: config
    };
}

function expandFilterPanel(expand) {
    return {
        type: EXPAND_FILTER_PANEL,
        expand: expand
    };
}

function configureQueryFormError(e) {
    return {
        type: QUERYFORM_CONFIG_LOAD_ERROR,
        error: e
    };
}

function getAttributeValues(ft, field, params) {
    return (dispatch) => {
        if (field.valueService && field.valueService.url) {
            let {url} = ConfigUtils.setUrlPlaceholders({url: field.valueService.url});

            for (let param in params) {
                if (params.hasOwnProperty(param)) {
                    url += "&" + param + "=" + params[param];
                }
            }

            return axios.get(url).then((response) => {
                let config = response.data;
                if (typeof config !== "object") {
                    try {
                        config = JSON.parse(config);
                    } catch(e) {
                        dispatch(configureQueryFormError('Configuration broken (' + url + '): ' + e.message));
                    }
                }

                let values = [];
                for (let feature in config.features) {
                    if (feature) {
                        values.push(config.features[feature].properties);
                    }
                }
                dispatch(configureFeatureType(ft, assign({}, field, {values: values})));
            }).catch((e) => {
                dispatch(configureQueryFormError(e));
            });
        }

        dispatch(configureFeatureType(ft, assign({}, field, {})));
    };
}

function loadFeatureTypeConfig(url, params) {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            let config = response.data;
            if (typeof config !== "object") {
                try {
                    config = JSON.parse(config);
                } catch(e) {
                    dispatch(configureQueryFormError('Configuration file broken (' + url + '): ' + e.message));
                }
            }

            // Configure QueryForm attributes
            for (let field in config.query.fields) {
                if (field) {
                    let f = config.query.fields[field];

                    let urlParams = f.valueService && f.valueService.urlParams ? assign({}, params, f.valueService.urlParams) : params;

                    dispatch(getAttributeValues({
                        id: config.featureTypeName,
                        name: config.featureTypeNameLabel,
                        geometryName: config.geometryName,
                        geometryType: config.geometryType
                    }, f, urlParams));
                }
            }

            // Configure the FeatureGrid for WFS results list
            dispatch(configureFeatureGrid(config.featuregrid));
            dispatch(configureFeatureInfo(config.featureinfo));
        }).catch((e) => {
            dispatch(configureQueryFormError(e));
        });
    };
}

/*function loadQueryFormConfig(configUrl, configName) {
    return (dispatch) => {
        return axios.get(configUrl + configName).then((response) => {
            let config = response.data;
            if (typeof config !== "object") {
                try {
                    config = JSON.parse(config);
                } catch(e) {
                    dispatch(configureQueryFormError('Configuration file broken (' + configUrl + "/" + configName + '): ' + e.message));
                }
            }

            dispatch(configureQueryForm(config));
        }).catch((e) => {
            dispatch(configureQueryFormError(e));
        });
    };
}*/

module.exports = {
    QUERYFORM_CONFIG_LOADED,
    FEATURETYPE_CONFIG_LOADED,
    EXPAND_FILTER_PANEL,
    QUERYFORM_CONFIG_LOAD_ERROR,
    FEATUREGRID_CONFIG_LOADED,
    FEATUREINFO_CONFIG_LOADED,
    TOPOLOGY_CONFIG_LOADED,
    configureTopology,
    configureFeatureGrid,
    // loadQueryFormConfig,
    loadFeatureTypeConfig,
    configureQueryForm,
    expandFilterPanel,
    configureQueryFormError,
    getAttributeValues
};
