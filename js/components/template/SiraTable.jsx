/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {AgGridReact} = require('ag-grid-react');
const {bindActionCreators} = require('redux');
const {connect} = require('react-redux');
const {selectRows} = require('../../actions/card');

const TemplateUtils = require('../../utils/TemplateUtils');

require("ag-grid/dist/styles/ag-grid.css");
require("ag-grid/dist/styles/theme-blue.css");

const SiraTable = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        card: React.PropTypes.object,
        style: React.PropTypes.object,
        columns: React.PropTypes.array,
        dependsOn: React.PropTypes.object,
        features: React.PropTypes.oneOfType([
            React.PropTypes.array,
            React.PropTypes.func
        ]),
        rowSelection: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.bool
        ]),
        selectRows: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            id: "SiraTable",
            style: {height: "200px", width: "100%"},
            features: [],
            card: null,
            dependsOn: null,
            columns: [],
            rowSelection: "single",
            selectRows: () => {}
        };
    },
    /*shouldComponentUpdate(nextProps) {
        let update = typeof nextProps.features === "function";

        if (this.props.dependsOn && nextProps.features && !update) {
            update = nextProps.features.length !== this.props.features.length;
            if (!update) {
                nextProps.features.forEach((feature, index) => {
                    update = feature.columnNumber !== this.props.features[index].columnNumber;
                }, this);
            }
        }

        return update;
    },*/
    render() {
        let features;
        if (typeof this.props.features === 'function') {
            features = this.props.features();
        } else {
            features = this.props.features.map((feature) => {
                let f = {};
                this.props.columns.forEach((column) => {
                    if (column.field) {
                        f[column.field] = TemplateUtils.getElement({xpath: column.xpath}, feature);
                    }
                });
                return f;
            });
        }

        if (this.props.dependsOn) {
            features = features.filter(function(feature) {
                return feature.id === this.props.card[this.props.dependsOn.tableId];
            }, this);
        }

        return (
            <div fluid={false} style={this.props.style} className="ag-blue">
                <AgGridReact
                    rowData={features}
                    onSelectionChanged={this.selectRows}
                    enableColResize={true}
                    columnDefs={
                        this.props.rowSelection === "single" ? [{
                            checkboxSelection: true,
                            width: 30,
                            headerName: ''
                        }, ...this.props.columns] : this.props.columns
                    }
                    {...this.props}/>
            </div>);
    },
    selectRows(params) {
        // this.props.selectRows(this.props.id, (params.selectedRows[0]) ? params.selectedRows[0].id : null);
        if (params.selectedRows[0]) {
            this.props.selectRows(this.props.id, params.selectedRows[0].id);
        }
    }
});

module.exports = connect((state) => {
    return {
        card: state.cardtemplate || {}
    };
}, dispatch => {
    return bindActionCreators({
        selectRows: selectRows
    }, dispatch);
})(SiraTable);
