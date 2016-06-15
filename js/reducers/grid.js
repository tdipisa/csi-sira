/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    GRID_MODEL_LOADED,
    GRID_LOAD_ERROR,
    GRID_CONFIG_LOADED,
    SHOW_LOADING
} = require('../actions/grid');

const assign = require('object-assign');
const TemplateUtils = require('../utils/TemplateUtils');

const initialState = {
    data: null,
    featuregrid: null,
    loadingGrid: false
    // featureGrigConfigUrl: "assets/featureGridConfig"
};

function grid(state = initialState, action) {
    switch (action.type) {
        case GRID_CONFIG_LOADED: {
            return assign({}, state, {
                featuregrid: action.config
            });
        }
        case GRID_MODEL_LOADED: {
            let features = TemplateUtils.getModels(action.data, state.featuregrid.grid.root, state.featuregrid.grid.columns);

            let data = {
                "type": "FeatureCollection",
                "totalFeatures": features.length,
                "features": [],
                "crs": {
                   "type": "name",
                   "properties": {
                      "name": "urn:ogc:def:crs:EPSG::4326"
                   }
                }
            };

            features = features.map((feature) => {
                let f = {
                    "type": "Feature",
                    "id": feature.id,
                    "geometry_name": "the_geom",
                    "properties": {}
                };

                for (let prop in feature) {
                    if (feature.hasOwnProperty(prop) && prop !== "geometry") {
                        f.properties[prop] = feature[prop];
                    }
                }

                f.geometry = {
                    "type": state.featuregrid.grid.geometryType
                };

                // Setting coordinates
                if (state.featuregrid.grid.geometryType === "Polygon") {
                    let coordinates = [[]];
                    for (let i = 0; feature.geometry && i < feature.geometry.coordinates.length; i++) {
                        let coords = state.featuregrid.grid.wfsVersion === "1.1.0" ?
                            [feature.geometry.coordinates[i][1], feature.geometry.coordinates[i][0]] : feature.geometry.coordinates[i];
                        coordinates[0].push(coords);
                    }

                    f.geometry.coordinates = coordinates;
                } else if (state.featuregrid.grid.geometryType === "Point") {
                    f.geometry.coordinates = feature.geometry ? [feature.geometry.coordinates[0][0], feature.geometry.coordinates[0][1]] : null;
                }

                return f;
            });

            data.features = features;

            return assign({}, state, {
                data: data.features,
                loadingGrid: false
            });
        }
        case GRID_LOAD_ERROR: {
            return assign({}, state, {
                loadingGridError: action.error,
                loadingGrid: false
            });
        }
        case SHOW_LOADING: {
            return assign({}, state, {
                loadingGrid: action.show
            });
        }
        default:
            return state;
    }
}

module.exports = grid;
