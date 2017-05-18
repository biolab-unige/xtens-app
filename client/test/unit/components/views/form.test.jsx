import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import { ReactMultiSelectAsyncComponent } from '../../../../js/components/views/form.jsx';

describe('ReactMultiSelectAsyncComponent', () => {

    beforeEach(() => {
        this.renderer = ReactTestUtils.createRenderer();
        this.props = {
            value: 'Fingolfin',
            loadOptions: () => {},
            onChange: () => {}
        };
    });

    describe('#constructor', () => {

        it('should instantiate the ReactMultiSelectAsyncComponent', () => {
            const component = new ReactMultiSelectAsyncComponent();
        });

    })

});
