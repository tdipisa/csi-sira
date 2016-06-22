/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    QUERYFORM_CONFIG_LOADED,
    FEATURETYPE_CONFIG_LOADED,
    EXPAND_FILTER_PANEL,
    QUERYFORM_CONFIG_LOAD_ERROR,
    FEATUREGRID_CONFIG_LOADED,
    FEATUREINFO_CONFIG_LOADED,
    TOPOLOGY_CONFIG_LOADED
} = require('../actions/siradec');

const assign = require('object-assign');

const initialState = {
    filterPanelExpanded: true,
    attributes: [],
    loadingQueryFormConfigError: null,
    queryform: null,
    featuregrid: null,
    featureinfo: null
};

function siradec(state = initialState, action) {
    switch (action.type) {
        case FEATURETYPE_CONFIG_LOADED: {
            let attributes = [...state.attributes, action.field];

            // Sorting the attributes by the given index in configuration
            attributes.sort((attA, attB) => {
                return attA.index - attB.index;
            });

            let newState = assign({}, state, {
                attributes: attributes,
                featureTypeName: action.ftName,
                featureTypeNameLabel: action.ftNameLabel
            });

            if (newState.queryform) {
                newState = assign({}, newState, {queryform: assign({}, newState.queryform, {geometryName: action.geometryName})});
            }

            if (newState.featuregrid) {
                newState = assign({}, newState, {featuregrid: assign({}, state.featuregrid, {geometryType: action.geometryType})});
            }

            return newState;
        }
        case QUERYFORM_CONFIG_LOADED: {
            return assign({}, state, {
                queryform: action.config
            });
        }
        case FEATUREGRID_CONFIG_LOADED: {
            return assign({}, state, {
                featuregrid: action.config
            });
        }
        case FEATUREINFO_CONFIG_LOADED: {
            return assign({}, state, {
                featureinfo: action.config
            });
        }
        case TOPOLOGY_CONFIG_LOADED: {
            return assign({}, state, {
                topology: action.config
            });
        }
        case EXPAND_FILTER_PANEL: {
            return assign({}, state, {
                filterPanelExpanded: action.expand
            });
        }
        case QUERYFORM_CONFIG_LOAD_ERROR: {
            return {
                loadingQueryFormConfigError: action.error
            };
        }
        default:
            return state;
    }
}

module.exports = siradec;
