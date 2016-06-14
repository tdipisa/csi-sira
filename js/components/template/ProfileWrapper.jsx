/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const ProfileWrapper = React.createClass({
    propTypes: {
        condition: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            condition: () => { return true; }
        };
    },
    render() {
        const Element = React.cloneElement(
            React.Children.toArray(this.props.children)
        );

        return (
            Element
        );
    }
});

module.exports = ProfileWrapper;
