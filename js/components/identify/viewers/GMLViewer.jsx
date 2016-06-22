/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const TemplateSira = require('../../template/TemplateSira');
const TemplateUtils = require('../../../utils/TemplateUtils');

const assign = require('object-assign');

const GMLViewer = React.createClass({
    propTypes: {
        params: React.PropTypes.object,
        profile: React.PropTypes.string,
        response: React.PropTypes.string,
        contentConfig: React.PropTypes.object,
        detailOpen: React.PropTypes.bool,
        actions: React.PropTypes.shape({
            onDetail: React.PropTypes.func,
            onShowDetail: React.PropTypes.func
        })
    },
    shouldComponentUpdate(nextProps) {
        return nextProps.response !== this.props.response;
    },
    onCellClicked(node) {
        if (node.colIndex === 0) {
            this.goToDetail(node.data);
        }
    },
    render() {
        const xml = this.props.response;
        // const authParam = this.props.authParam;
        const model = {
            // authParam: authParam,
            profile: this.props.profile,
            getValue: (element) => TemplateUtils.getValue(xml, element, null)
        };

        /*let model = TemplateUtils.getModels(this.props.response,
            this.props.contentConfig.modelConfig.root,
            this.props.contentConfig.modelConfig.columns, "1.1.0");*/

        return (
            <TemplateSira
                template={this.props.contentConfig.template}
                model={model}
                onCellClicked={this.onCellClicked}/>
        );
    },
    goToDetail(data) {
        /*let reqURL = this.props.contentConfig.detailsConfig.wfsUrl + "&FEATUREID=" + data.id;
        for (let param in this.props.params) {
            if (this.props.params.hasOwnProperty(param)) {
                reqURL += "&" + param + "=" + this.props.params[param];
            }
        }*/

        let url = this.props.contentConfig.detailsConfig.service.url;
        let urlParams = this.props.contentConfig.detailsConfig.service.params;
        let params = assign({}, this.props.params, urlParams);
        for (let param in params) {
            if (params.hasOwnProperty(param)) {
                url += "&" + param + "=" + params[param];
            }
        }

        let reqURL = url + "&FEATUREID=" + data.id;

        this.props.actions.onDetail(
            this.props.contentConfig.detailsConfig.template,
            /*this.props.contentConfig.detailsConfig.cardModelConfigUrl,*/
            reqURL
        );

        if (!this.props.detailOpen) {
            this.props.actions.onShowDetail();
        }
    }
});

module.exports = GMLViewer;
