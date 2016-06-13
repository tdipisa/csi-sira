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
        style: React.PropTypes.object,
        columnDefs: React.PropTypes.array,
        features: React.PropTypes.oneOfType([
            React.PropTypes.array,
            React.PropTypes.func
        ]),
        selectRows: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            id: "SiraTable",
            style: {height: "200px", width: "100%"},
            features: [],
            columnDefs: [],
            selectRows: () => {}
        };
    },
    render() {
        let features;
        if (typeof this.props.features === 'function') {
            features = this.props.features();
        } else {
            features = this.props.features.map((feature) => {
                let f = {};
                this.props.columnDefs.forEach((column) => {
                    f[column.field] = TemplateUtils.getElement({xpath: column.xpath}, feature)[0];
                });
                return f;
            });
        }

        return (
            <div fluid={false} style={this.props.style} className="ag-blue">
                <AgGridReact
                    rowSelection="single"
                    rowData={features}
                    onSelectionChanged={this.selectRows}
                    enableColResize={true}
                    {...this.props}/>
            </div>);
    },
    selectRows(params) {
        this.props.selectRows(this.props.id, (params.selectedRows[0]) ? params.selectedRows[0].id : null);
    }
});
module.exports = connect(null, dispatch => {
    return bindActionCreators({
        selectRows: selectRows
    }, dispatch);
})(SiraTable);
