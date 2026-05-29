(function () {
    'use strict';

    var registerBlockType = wp.blocks.registerBlockType;
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var InnerBlocks = wp.blockEditor.InnerBlocks;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var ColorPalette = wp.components.ColorPalette;

    var TEMPLATE = [
        ['core/group', { className: 'atx-col atx-col-left' }, []],
        ['core/group', { className: 'atx-col atx-col-right' }, []],
    ];

    var RATIO_OPTIONS = [
        { label: '50 / 50', value: '50-50' },
        { label: '60 / 40', value: '60-40' },
        { label: '40 / 60', value: '40-60' },
        { label: '70 / 30', value: '70-30' },
        { label: '30 / 70', value: '30-70' },
    ];

    var VERTICAL_ALIGN_OPTIONS = [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Stretch', value: 'stretch' },
    ];

    var ALIGN_MAP = {
        top: 'flex-start',
        center: 'center',
        bottom: 'flex-end',
        stretch: 'stretch',
    };

    function getRatioWidths(ratio) {
        var parts = ratio.split('-');
        return {
            left: parts[0] + '%',
            right: parts[1] + '%',
        };
    }

    registerBlockType('atx-popup/two-columns', {
        title: 'ATX Two Columns',
        description: 'Two-column layout with adjustable split ratio.',
        icon: 'columns',
        category: 'atx-popup',

        attributes: {
            columnRatio: {
                type: 'string',
                default: '50-50',
            },
            gap: {
                type: 'number',
                default: 20,
            },
            verticalAlign: {
                type: 'string',
                default: 'top',
            },
            stackOnMobile: {
                type: 'boolean',
                default: true,
            },
            backgroundColor: {
                type: 'string',
                default: '',
            },
            padding: {
                type: 'number',
                default: 20,
            },
            hasDivider: {
                type: 'boolean',
                default: false,
            },
            dividerColor: {
                type: 'string',
                default: '#e0e0e0',
            },
            marginX: {
                type: 'number',
                default: 0,
            },
        },

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var className = props.className;

            var ratioWidths = getRatioWidths(attributes.columnRatio);
            var ratioClass = 'atx-ratio-' + attributes.columnRatio;

            var wrapperStyle = {
                display: 'flex',
                gap: attributes.gap + 'px',
                alignItems: ALIGN_MAP[attributes.verticalAlign] || 'flex-start',
                backgroundColor: attributes.backgroundColor || undefined,
                padding: attributes.padding + 'px',
            };
            if (attributes.marginX > 0) {
                wrapperStyle.marginLeft = attributes.marginX + 'px';
                wrapperStyle.marginRight = attributes.marginX + 'px';
            }

            var inspectorControls = el(
                InspectorControls,
                null,
                el(
                    PanelBody,
                    { title: 'Layout', initialOpen: true },
                    el(SelectControl, {
                        label: 'Column Ratio',
                        value: attributes.columnRatio,
                        options: RATIO_OPTIONS,
                        onChange: function (value) {
                            setAttributes({ columnRatio: value });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Gap (px)',
                        value: attributes.gap,
                        onChange: function (value) {
                            setAttributes({ gap: value });
                        },
                        min: 0,
                        max: 80,
                    }),
                    el(SelectControl, {
                        label: 'Vertical Alignment',
                        value: attributes.verticalAlign,
                        options: VERTICAL_ALIGN_OPTIONS,
                        onChange: function (value) {
                            setAttributes({ verticalAlign: value });
                        },
                    }),
                    el(ToggleControl, {
                        label: 'Stack on Mobile',
                        checked: attributes.stackOnMobile,
                        onChange: function (value) {
                            setAttributes({ stackOnMobile: value });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Horizontal Margin (px)',
                        value: attributes.marginX,
                        onChange: function (v) {
                            setAttributes({ marginX: v });
                        },
                        min: 0,
                        max: 80,
                        step: 2,
                    })
                ),
                el(
                    PanelBody,
                    { title: 'Style', initialOpen: false },
                    el('p', { style: { marginBottom: '8px' } }, 'Background Color'),
                    el(ColorPalette, {
                        value: attributes.backgroundColor,
                        onChange: function (value) {
                            setAttributes({ backgroundColor: value || '' });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Padding (px)',
                        value: attributes.padding,
                        onChange: function (value) {
                            setAttributes({ padding: value });
                        },
                        min: 0,
                        max: 80,
                    })
                ),
                el(
                    PanelBody,
                    { title: 'Divider', initialOpen: false },
                    el(ToggleControl, {
                        label: 'Show Divider Between Columns',
                        checked: attributes.hasDivider,
                        onChange: function (value) {
                            setAttributes({ hasDivider: value });
                        },
                    }),
                    attributes.hasDivider &&
                        el(Fragment, null,
                            el('p', { style: { marginBottom: '8px' } }, 'Divider Color'),
                            el(ColorPalette, {
                                value: attributes.dividerColor,
                                onChange: function (value) {
                                    setAttributes({ dividerColor: value || '#e0e0e0' });
                                },
                            })
                        )
                )
            );

            // Inline style tag for editor column widths based on ratio
            var editorStyle = el('style', null,
                '.atx-two-columns-block.atx-ratio-' + attributes.columnRatio + ' > .block-editor-inner-blocks > .block-editor-block-list__layout > *:first-child { flex-basis: ' + ratioWidths.left + '; min-width: 0; }' +
                '.atx-two-columns-block.atx-ratio-' + attributes.columnRatio + ' > .block-editor-inner-blocks > .block-editor-block-list__layout > *:last-child { flex-basis: ' + ratioWidths.right + '; min-width: 0; }' +
                '.atx-two-columns-block > .block-editor-inner-blocks > .block-editor-block-list__layout { display: flex; gap: ' + attributes.gap + 'px; align-items: ' + (ALIGN_MAP[attributes.verticalAlign] || 'flex-start') + '; }' +
                (attributes.hasDivider
                    ? '.atx-two-columns-block.atx-ratio-' + attributes.columnRatio + ' > .block-editor-inner-blocks > .block-editor-block-list__layout > *:first-child { border-right: 1px solid ' + attributes.dividerColor + '; padding-right: ' + (attributes.gap / 2) + 'px; }'
                    : '')
            );

            var wrapperClasses = [
                'atx-two-columns-block',
                ratioClass,
                attributes.stackOnMobile ? 'atx-stack-mobile' : '',
                attributes.hasDivider ? 'atx-has-divider' : '',
                className || '',
            ].filter(Boolean).join(' ');

            var blockProps = useBlockProps({
                className: wrapperClasses,
                style: {
                    backgroundColor: attributes.backgroundColor || undefined,
                    padding: attributes.padding + 'px',
                },
            });

            return el(
                Fragment,
                null,
                inspectorControls,
                editorStyle,
                el(
                    'div',
                    blockProps,
                    el(InnerBlocks, {
                        template: TEMPLATE,
                        templateLock: false,
                    })
                )
            );
        },

        save: function (props) {
            var attributes = props.attributes;

            var ratioClass = 'atx-ratio-' + attributes.columnRatio;

            var wrapperClasses = [
                'atx-two-columns-block',
                ratioClass,
                attributes.stackOnMobile ? 'atx-stack-mobile' : '',
                attributes.hasDivider ? 'atx-has-divider' : '',
            ].filter(Boolean).join(' ');

            var wrapperStyle = {
                display: 'flex',
                gap: attributes.gap + 'px',
                alignItems: ALIGN_MAP[attributes.verticalAlign] || 'flex-start',
                backgroundColor: attributes.backgroundColor || undefined,
                padding: attributes.padding + 'px',
            };
            if (attributes.marginX > 0) {
                wrapperStyle.marginLeft = attributes.marginX + 'px';
                wrapperStyle.marginRight = attributes.marginX + 'px';
            }

            var blockProps = useBlockProps.save({
                className: wrapperClasses,
                style: wrapperStyle,
                'data-ratio': attributes.columnRatio,
                'data-stack-mobile': attributes.stackOnMobile ? 'true' : 'false',
                'data-divider-color': attributes.hasDivider ? attributes.dividerColor : undefined,
            });

            return el(
                'div',
                blockProps,
                el(InnerBlocks.Content)
            );
        },
    });
})();
