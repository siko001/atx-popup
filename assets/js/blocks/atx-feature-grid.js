(function () {
    const { registerBlockType } = wp.blocks;
    const el = wp.element.createElement;
    const { Fragment } = wp.element;
    const { InspectorControls, RichText, MediaUpload, useBlockProps } = wp.blockEditor;
    const { PanelBody, Button, RangeControl, SelectControl, ColorPalette, TextControl } = wp.components;

    const DEFAULT_ITEMS = [
        { icon: 'star-filled', title: 'Feature One', description: 'Brief description of this feature.', image: {} },
        { icon: 'heart', title: 'Feature Two', description: 'Brief description of this feature.', image: {} },
        { icon: 'admin-tools', title: 'Feature Three', description: 'Brief description of this feature.', image: {} }
    ];

    registerBlockType('atx-popup/feature-grid', {
        title: 'ATX Feature Grid',
        description: 'Grid of feature items with icons and descriptions.',
        icon: 'grid-view',
        category: 'atx-popup',
        attributes: {
            items: {
                type: 'array',
                default: DEFAULT_ITEMS
            },
            columns: {
                type: 'number',
                default: 3
            },
            gap: {
                type: 'number',
                default: 20
            },
            iconSize: {
                type: 'number',
                default: 36
            },
            iconColor: {
                type: 'string',
                default: '#e94560'
            },
            cardBgColor: {
                type: 'string',
                default: '#f8f9fa'
            },
            cardBorderRadius: {
                type: 'number',
                default: 8
            },
            textAlign: {
                type: 'string',
                default: 'center'
            },
            textColor: {
                type: 'string',
                default: '#333333'
            },
            padding: {
                type: 'number',
                default: 20
            },
            iconPosition: {
                type: 'string',
                default: 'top'
            },
            justifyItems: {
                type: 'string',
                default: 'stretch'
            },
            marginX: {
                type: 'number',
                default: 0
            }
        },

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var items = attributes.items;
            var columns = attributes.columns;
            var gap = attributes.gap;
            var iconSize = attributes.iconSize;
            var iconColor = attributes.iconColor;
            var cardBgColor = attributes.cardBgColor;
            var cardBorderRadius = attributes.cardBorderRadius;
            var textAlign = attributes.textAlign;
            var textColor = attributes.textColor;
            var padding = attributes.padding;
            var iconPosition = attributes.iconPosition;

            function updateItem(index, key, value) {
                var newItems = items.map(function (item, i) {
                    if (i === index) {
                        var updated = {};
                        for (var k in item) {
                            updated[k] = item[k];
                        }
                        updated[key] = value;
                        return updated;
                    }
                    return item;
                });
                setAttributes({ items: newItems });
            }

            function removeItem(index) {
                var newItems = items.filter(function (_, i) {
                    return i !== index;
                });
                setAttributes({ items: newItems });
            }

            function moveItem(index, direction) {
                var newIndex = index + direction;
                if (newIndex < 0 || newIndex >= items.length) return;
                var newItems = items.slice();
                var temp = newItems[index];
                newItems[index] = newItems[newIndex];
                newItems[newIndex] = temp;
                setAttributes({ items: newItems });
            }

            function addItem() {
                var newItems = items.concat([
                    { icon: 'star-filled', title: 'New Feature', description: 'Brief description of this feature.', image: {} }
                ]);
                setAttributes({ items: newItems });
            }

            var justifyVal = attributes.justifyItems || 'stretch';
            var isStretch = justifyVal === 'stretch';

            var gridStyle = {
                display: 'flex',
                flexWrap: 'wrap',
                gap: gap + 'px',
                justifyContent: isStretch ? 'flex-start' : justifyVal,
            };

            var cardBasis = 'calc((100% - ' + (columns - 1) * gap + 'px) / ' + columns + ')';
            var cardStyle = {
                backgroundColor: cardBgColor,
                borderRadius: cardBorderRadius + 'px',
                padding: padding + 'px',
                textAlign: iconPosition === 'left' ? 'left' : textAlign,
                color: textColor,
                position: 'relative',
                flex: (isStretch ? '1' : '0') + ' 1 ' + cardBasis,
                maxWidth: isStretch ? 'none' : cardBasis,
                boxSizing: 'border-box',
            };
            if (iconPosition === 'left') {
                cardStyle.display = 'flex';
                cardStyle.alignItems = 'flex-start';
                cardStyle.gap = '12px';
            }

            var iconStyle = {
                fontSize: iconSize + 'px',
                width: iconSize + 'px',
                height: iconSize + 'px',
                color: iconColor,
                display: 'inline-block',
                marginBottom: '10px'
            };

            var removeButtonStyle = {
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                cursor: 'pointer',
                lineHeight: '22px',
                textAlign: 'center',
                padding: '0',
                fontSize: '12px'
            };

            var inspectorControls = el(
                InspectorControls,
                null,
                el(
                    PanelBody,
                    { title: 'Grid Layout', initialOpen: true },
                    el(RangeControl, {
                        label: 'Columns',
                        value: columns,
                        onChange: function (val) { setAttributes({ columns: val }); },
                        min: 2,
                        max: 4
                    }),
                    el(RangeControl, {
                        label: 'Gap (px)',
                        value: gap,
                        onChange: function (val) { setAttributes({ gap: val }); },
                        min: 0,
                        max: 60
                    }),
                    el(SelectControl, {
                        label: 'Alignment',
                        help: 'How to arrange items when the last row is incomplete.',
                        value: attributes.justifyItems,
                        options: [
                            { label: 'Left', value: 'flex-start' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'flex-end' },
                            { label: 'Stretch (fill row)', value: 'stretch' },
                            { label: 'Space Between', value: 'space-between' },
                            { label: 'Space Evenly', value: 'space-evenly' },
                        ],
                        onChange: function (val) { setAttributes({ justifyItems: val }); }
                    }),
                    el(SelectControl, {
                        label: 'Icon Position',
                        value: iconPosition,
                        options: [
                            { label: 'Top (centered)', value: 'top' },
                            { label: 'Left (inline)', value: 'left' }
                        ],
                        onChange: function (val) { setAttributes({ iconPosition: val }); }
                    }),
                    el(RangeControl, {
                        label: 'Horizontal Margin (px)',
                        value: attributes.marginX,
                        onChange: function (v) { setAttributes({ marginX: v }); },
                        min: 0,
                        max: 80,
                        step: 2
                    })
                ),
                el(
                    PanelBody,
                    { title: 'Card Style', initialOpen: false },
                    el('p', { style: { marginBottom: '4px' } }, 'Background Color'),
                    el(ColorPalette, {
                        value: cardBgColor,
                        onChange: function (val) { setAttributes({ cardBgColor: val || '#f8f9fa' }); }
                    }),
                    el(RangeControl, {
                        label: 'Border Radius (px)',
                        value: cardBorderRadius,
                        onChange: function (val) { setAttributes({ cardBorderRadius: val }); },
                        min: 0,
                        max: 40
                    }),
                    el(RangeControl, {
                        label: 'Padding (px)',
                        value: padding,
                        onChange: function (val) { setAttributes({ padding: val }); },
                        min: 0,
                        max: 60
                    }),
                    el(SelectControl, {
                        label: 'Text Alignment',
                        value: textAlign,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' }
                        ],
                        onChange: function (val) { setAttributes({ textAlign: val }); }
                    }),
                    el('p', { style: { marginBottom: '4px' } }, 'Text Color'),
                    el(ColorPalette, {
                        value: textColor,
                        onChange: function (val) { setAttributes({ textColor: val || '#333333' }); }
                    })
                ),
                el(
                    PanelBody,
                    { title: 'Icon Style', initialOpen: false },
                    el(RangeControl, {
                        label: 'Icon Size (px)',
                        value: iconSize,
                        onChange: function (val) { setAttributes({ iconSize: val }); },
                        min: 16,
                        max: 72
                    }),
                    el('p', { style: { marginBottom: '4px' } }, 'Icon Color'),
                    el(ColorPalette, {
                        value: iconColor,
                        onChange: function (val) { setAttributes({ iconColor: val || '#e94560' }); }
                    })
                )
            );

            var gridItems = items.map(function (item, index) {
                var iconOrImage;
                if (item.image && item.image.url) {
                    iconOrImage = el(
                        'div',
                        { style: { position: 'relative', display: 'inline-block', flexShrink: 0 } },
                        el('img', {
                            src: item.image.url,
                            alt: item.image.alt || '',
                            style: {
                                width: iconSize + 'px',
                                height: iconSize + 'px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                display: 'block'
                            }
                        }),
                        el(
                            'button',
                            {
                                style: {
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    lineHeight: '18px',
                                    textAlign: 'center',
                                    padding: '0',
                                    fontSize: '10px'
                                },
                                onClick: function () { updateItem(index, 'image', {}); },
                                title: 'Remove image',
                                type: 'button'
                            },
                            '\u00D7'
                        )
                    );
                } else {
                    iconOrImage = el('span', {
                        className: 'dashicons dashicons-' + item.icon,
                        style: iconStyle
                    });
                }

                var mediaUploadButton = el(MediaUpload, {
                    onSelect: function (media) {
                        updateItem(index, 'image', { id: media.id, url: media.url, alt: media.alt || '' });
                    },
                    allowedTypes: ['image'],
                    render: function (obj) {
                        return el(Button, {
                            onClick: obj.open,
                            isSmall: true,
                            variant: 'secondary',
                            style: { marginTop: '4px' },
                            icon: 'format-image',
                            label: 'Card Image'
                        });
                    }
                });

                var iconSection = el(TextControl, {
                    label: 'Icon (dashicon name)',
                    value: item.icon,
                    onChange: function (val) { updateItem(index, 'icon', val); },
                    style: { marginTop: '8px' }
                });

                var titleEl = el(RichText, {
                    tagName: 'h4',
                    value: item.title,
                    onChange: function (val) { updateItem(index, 'title', val); },
                    placeholder: 'Feature title...',
                    style: { margin: '8px 0 4px', color: textColor }
                });

                var descEl = el(RichText, {
                    tagName: 'p',
                    value: item.description,
                    onChange: function (val) { updateItem(index, 'description', val); },
                    placeholder: 'Feature description...',
                    style: { margin: '0', color: textColor }
                });

                var removeBtn = el(
                    'button',
                    {
                        style: removeButtonStyle,
                        onClick: function () { removeItem(index); },
                        title: 'Remove item',
                        type: 'button'
                    },
                    '\u00D7'
                );

                // Move buttons
                var moveLeftBtn = index > 0 ? el('button', {
                    style: { position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', lineHeight: '22px', textAlign: 'center', padding: '0', fontSize: '14px' },
                    onClick: function () { moveItem(index, -1); },
                    title: 'Move left',
                    type: 'button'
                }, '\u2039') : null;

                var moveRightBtn = index < items.length - 1 ? el('button', {
                    style: { position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', lineHeight: '22px', textAlign: 'center', padding: '0', fontSize: '14px' },
                    onClick: function () { moveItem(index, 1); },
                    title: 'Move right',
                    type: 'button'
                }, '\u203A') : null;

                if (iconPosition === 'left') {
                    return el(
                        'div',
                        { key: index, style: cardStyle },
                        removeBtn,
                        moveLeftBtn,
                        moveRightBtn,
                        el('div', { style: { flexShrink: 0 } },
                            iconOrImage,
                            mediaUploadButton
                        ),
                        el('div', { style: { flex: 1 } },
                            iconSection,
                            titleEl,
                            descEl
                        )
                    );
                }

                return el(
                    'div',
                    { key: index, style: cardStyle },
                    removeBtn,
                    moveLeftBtn,
                    moveRightBtn,
                    iconOrImage,
                    mediaUploadButton,
                    iconSection,
                    titleEl,
                    descEl
                );
            });

            var blockProps = useBlockProps({
                className: 'atx-feature-grid-block',
                style: attributes.marginX > 0 ? { marginLeft: attributes.marginX + 'px', marginRight: attributes.marginX + 'px' } : {},
            });

            return el(
                Fragment,
                null,
                inspectorControls,
                el(
                    'div',
                    blockProps,
                    el('div', { style: gridStyle }, gridItems),
                    el(
                        Button,
                        {
                            isPrimary: true,
                            onClick: addItem,
                            style: { marginTop: '16px' }
                        },
                        'Add Item'
                    )
                )
            );
        },

        save: function (props) {
            var attributes = props.attributes;
            var items = attributes.items;
            var columns = attributes.columns;
            var gap = attributes.gap;
            var iconSize = attributes.iconSize;
            var iconColor = attributes.iconColor;
            var cardBgColor = attributes.cardBgColor;
            var cardBorderRadius = attributes.cardBorderRadius;
            var textAlign = attributes.textAlign;
            var textColor = attributes.textColor;
            var padding = attributes.padding;
            var iconPosition = attributes.iconPosition;

            var saveJustifyVal = attributes.justifyItems || 'stretch';
            var saveIsStretch = saveJustifyVal === 'stretch';

            var gridStyle = {
                display: 'flex',
                flexWrap: 'wrap',
                gap: gap + 'px',
                justifyContent: saveIsStretch ? 'flex-start' : saveJustifyVal,
            };

            var cardBasis = 'calc((100% - ' + (columns - 1) * gap + 'px) / ' + columns + ')';
            var cardStyle = {
                backgroundColor: cardBgColor,
                borderRadius: cardBorderRadius + 'px',
                padding: padding + 'px',
                textAlign: iconPosition === 'left' ? 'left' : textAlign,
                color: textColor,
                flex: (saveIsStretch ? '1' : '0') + ' 1 ' + cardBasis,
                maxWidth: saveIsStretch ? 'none' : cardBasis,
                boxSizing: 'border-box',
            };
            if (iconPosition === 'left') {
                cardStyle.display = 'flex';
                cardStyle.alignItems = 'flex-start';
                cardStyle.gap = '12px';
            }

            var iconStyle = {
                fontSize: iconSize + 'px',
                width: iconSize + 'px',
                height: iconSize + 'px',
                color: iconColor,
                display: 'inline-block',
                marginBottom: '10px'
            };

            var gridItems = items.map(function (item, index) {
                var iconOrImage;
                if (item.image && item.image.url) {
                    iconOrImage = el('img', {
                        src: item.image.url,
                        alt: item.image.alt || '',
                        style: {
                            width: iconSize + 'px',
                            height: iconSize + 'px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            display: 'block'
                        }
                    });
                } else {
                    iconOrImage = el('span', {
                        className: 'dashicons dashicons-' + item.icon,
                        style: iconStyle,
                        'aria-hidden': 'true',
                    });
                }

                if (iconPosition === 'left') {
                    return el(
                        'div',
                        { key: index, style: cardStyle, role: 'listitem' },
                        el('div', { style: { flexShrink: 0 } }, iconOrImage),
                        el('div', { style: { flex: 1 } },
                            el('h4', { style: { color: textColor } }, item.title),
                            el('p', { style: { color: textColor } }, item.description)
                        )
                    );
                }

                return el(
                    'div',
                    { key: index, style: cardStyle, role: 'listitem' },
                    iconOrImage,
                    el('h4', { style: { color: textColor } }, item.title),
                    el('p', { style: { color: textColor } }, item.description)
                );
            });

            var blockProps = useBlockProps.save({
                className: 'atx-feature-grid-block',
                style: attributes.marginX > 0 ? { marginLeft: attributes.marginX + 'px', marginRight: attributes.marginX + 'px' } : {},
            });

            return el(
                'div',
                blockProps,
                el('div', { style: gridStyle, role: 'list' }, gridItems)
            );
        }
    });
})();
