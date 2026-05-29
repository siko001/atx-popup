(function () {
    const { registerBlockType } = wp.blocks;
    const el = wp.element.createElement;
    const { Fragment } = wp.element;
    const { InspectorControls, RichText, MediaUpload, MediaUploadCheck, useBlockProps } = wp.blockEditor;
    const {
        PanelBody,
        Button,
        RangeControl,
        SelectControl,
        ToggleControl,
        ColorPalette,
        TextControl,
    } = wp.components;

    registerBlockType('atx-popup/cta-banner', {
        title: 'ATX CTA Banner',
        description: 'Eye-catching call-to-action banner with icon, text, and button.',
        icon: 'megaphone',
        category: 'atx-popup',
        attributes: {
            layout: { type: 'string', default: 'horizontal' },
            iconType: { type: 'string', default: 'dashicon' },
            dashicon: { type: 'string', default: 'megaphone' },
            iconImage: { type: 'object', default: {} },
            iconSize: { type: 'number', default: 48 },
            iconColor: { type: 'string', default: '#e94560' },
            heading: { type: 'string', default: 'Special Offer!' },
            description: { type: 'string', default: 'Get 20% off your first order. Limited time only.' },
            buttonText: { type: 'string', default: 'Claim Now' },
            buttonUrl: { type: 'string', default: '#' },
            buttonBgColor: { type: 'string', default: '#e94560' },
            buttonTextColor: { type: 'string', default: '#ffffff' },
            buttonBorderRadius: { type: 'number', default: 4 },
            secondaryText: { type: 'string', default: '' },
            secondaryUrl: { type: 'string', default: '' },
            backgroundColor: { type: 'string', default: '#ffffff' },
            textColor: { type: 'string', default: '#333333' },
            borderRadius: { type: 'number', default: 8 },
            maxWidth: { type: 'number', default: 0 },
            hasShadow: { type: 'boolean', default: true },
            padding: { type: 'number', default: 30 },
            backgroundImage: { type: 'object', default: {} },
            backgroundAttachment: { type: 'string', default: 'scroll' },
            imagePosition: { type: 'string', default: 'left' },
            marginX: { type: 'number', default: 0 },
        },

        edit: function (props) {
            var attrs = props.attributes;
            var setAttributes = props.setAttributes;

            var isImageLayout = attrs.layout.indexOf('image-') === 0;

            var flexDir = 'row';
            if (attrs.layout === 'vertical' || attrs.layout === 'image-top') flexDir = 'column';
            else if (attrs.layout === 'horizontal' || attrs.layout === 'image-left') flexDir = 'row';
            else if (attrs.layout === 'image-right') flexDir = 'row-reverse';
            else if (attrs.layout === 'image-bottom') flexDir = 'column-reverse';

            var containerStyle = {
                display: 'flex',
                flexDirection: flexDir,
                alignItems: (attrs.layout === 'horizontal' || attrs.layout === 'vertical') ? 'center' : 'stretch',
                gap: isImageLayout ? '0px' : '20px',
                backgroundColor: attrs.backgroundColor,
                color: attrs.textColor,
                borderRadius: attrs.borderRadius + 'px',
                padding: isImageLayout ? '0px' : attrs.padding + 'px',
                boxShadow: attrs.hasShadow ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                overflow: 'hidden',
            };
            if (attrs.maxWidth > 0) {
                containerStyle.maxWidth = attrs.maxWidth + 'px';
                containerStyle.marginLeft = 'auto';
                containerStyle.marginRight = 'auto';
            }
            if (attrs.marginX > 0) {
                containerStyle.marginLeft = attrs.marginX + 'px';
                containerStyle.marginRight = attrs.marginX + 'px';
            }

            if (attrs.backgroundImage && attrs.backgroundImage.url) {
                containerStyle.backgroundImage = 'url(' + attrs.backgroundImage.url + ')';
                containerStyle.backgroundSize = 'cover';
                containerStyle.backgroundPosition = 'center';
                containerStyle.backgroundAttachment = attrs.backgroundAttachment;
            }

            var iconAreaStyle = {
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            };

            if (isImageLayout) {
                iconAreaStyle.flex = '0 0 50%';
                iconAreaStyle.overflow = 'hidden';
                if (attrs.layout === 'image-left' || attrs.layout === 'image-right') {
                    iconAreaStyle.minHeight = '180px';
                }
            }

            var contentAreaStyle = {
                flex: 1,
                textAlign: (attrs.layout === 'vertical' || attrs.layout === 'image-top' || attrs.layout === 'image-bottom') ? 'center' : 'left',
            };

            if (isImageLayout) {
                contentAreaStyle.padding = attrs.padding + 'px';
            }

            var buttonStyle = {
                display: 'inline-block',
                backgroundColor: attrs.buttonBgColor,
                color: attrs.buttonTextColor,
                padding: '10px 24px',
                borderRadius: attrs.buttonBorderRadius + 'px',
                textDecoration: 'none',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px',
            };

            // Build icon element
            var iconEl = null;
            if (isImageLayout && attrs.iconImage && attrs.iconImage.url) {
                iconEl = el('img', {
                    src: attrs.iconImage.url,
                    alt: attrs.iconImage.alt || '',
                    style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        minHeight: '180px',
                        display: 'block',
                    },
                });
            } else if (attrs.iconType === 'dashicon') {
                iconEl = el('span', {
                    className: 'dashicons dashicons-' + attrs.dashicon,
                    style: {
                        fontSize: attrs.iconSize + 'px',
                        width: attrs.iconSize + 'px',
                        height: attrs.iconSize + 'px',
                        color: attrs.iconColor,
                    },
                });
            } else if (attrs.iconType === 'image' && attrs.iconImage && attrs.iconImage.url) {
                iconEl = el('img', {
                    src: attrs.iconImage.url,
                    alt: attrs.iconImage.alt || '',
                    style: {
                        width: attrs.iconSize + 'px',
                        height: attrs.iconSize + 'px',
                        objectFit: 'contain',
                    },
                });
            }

            // Inspector Controls
            var inspector = el(
                InspectorControls,
                null,

                // Layout Panel
                el(
                    PanelBody,
                    { title: 'Layout', initialOpen: true },
                    el(SelectControl, {
                        label: 'Layout Direction',
                        value: attrs.layout,
                        options: [
                            { label: 'Horizontal', value: 'horizontal' },
                            { label: 'Vertical', value: 'vertical' },
                            { label: 'Image Left', value: 'image-left' },
                            { label: 'Image Right', value: 'image-right' },
                            { label: 'Image Top', value: 'image-top' },
                            { label: 'Image Bottom', value: 'image-bottom' },
                        ],
                        onChange: function (val) {
                            setAttributes({ layout: val });
                        },
                    })
                ),

                // Icon Panel
                el(
                    PanelBody,
                    { title: 'Icon', initialOpen: false },
                    el(SelectControl, {
                        label: 'Icon Type',
                        value: attrs.iconType,
                        options: [
                            { label: 'Dashicon', value: 'dashicon' },
                            { label: 'Custom Image', value: 'image' },
                            { label: 'None', value: 'none' },
                        ],
                        onChange: function (val) {
                            setAttributes({ iconType: val });
                        },
                    }),
                    attrs.iconType === 'dashicon'
                        ? el(Fragment, null,
                            el(TextControl, {
                                label: 'Dashicon Name',
                                help: 'Enter the dashicon name without the "dashicons-" prefix (e.g. "megaphone", "cart", "star-filled").',
                                value: attrs.dashicon,
                                onChange: function (val) {
                                    setAttributes({ dashicon: val });
                                },
                            }),
                            el('div', { style: { marginBottom: '12px' } },
                                el('span', {
                                    className: 'dashicons dashicons-' + attrs.dashicon,
                                    style: { fontSize: '32px', width: '32px', height: '32px', color: attrs.iconColor },
                                }),
                                el('span', { style: { marginLeft: '8px', verticalAlign: 'super' } }, 'Preview')
                            ),
                            el('p', { style: { marginBottom: '8px', fontWeight: 'bold' } }, 'Icon Color'),
                            el(ColorPalette, {
                                value: attrs.iconColor,
                                onChange: function (val) {
                                    setAttributes({ iconColor: val || '#e94560' });
                                },
                            })
                        )
                        : null,
                    attrs.iconType === 'image'
                        ? el(
                            MediaUploadCheck,
                            null,
                            el(MediaUpload, {
                                onSelect: function (media) {
                                    setAttributes({
                                        iconImage: {
                                            id: media.id,
                                            url: media.url,
                                            alt: media.alt || '',
                                        },
                                    });
                                },
                                allowedTypes: ['image'],
                                value: attrs.iconImage.id,
                                render: function (obj) {
                                    return el(
                                        Fragment,
                                        null,
                                        attrs.iconImage && attrs.iconImage.url
                                            ? el(
                                                'div',
                                                { style: { marginBottom: '12px' } },
                                                el('img', {
                                                    src: attrs.iconImage.url,
                                                    alt: attrs.iconImage.alt || '',
                                                    style: { maxWidth: '100px', maxHeight: '100px', display: 'block', marginBottom: '8px' },
                                                }),
                                                el(
                                                    Button,
                                                    {
                                                        onClick: obj.open,
                                                        variant: 'secondary',
                                                        isSmall: true,
                                                        style: { marginRight: '8px' },
                                                    },
                                                    'Replace Image'
                                                ),
                                                el(
                                                    Button,
                                                    {
                                                        onClick: function () {
                                                            setAttributes({ iconImage: {} });
                                                        },
                                                        variant: 'tertiary',
                                                        isSmall: true,
                                                        isDestructive: true,
                                                    },
                                                    'Remove'
                                                )
                                            )
                                            : el(
                                                Button,
                                                {
                                                    onClick: obj.open,
                                                    variant: 'secondary',
                                                },
                                                'Upload Icon Image'
                                            )
                                    );
                                },
                            })
                        )
                        : null,
                    attrs.iconType !== 'none'
                        ? el(RangeControl, {
                            label: 'Icon Size',
                            value: attrs.iconSize,
                            onChange: function (val) {
                                setAttributes({ iconSize: val });
                            },
                            min: 16,
                            max: 128,
                        })
                        : null
                ),

                // Button Style Panel
                el(
                    PanelBody,
                    { title: 'Button Style', initialOpen: false },
                    el(TextControl, {
                        label: 'Button URL',
                        value: attrs.buttonUrl,
                        onChange: function (val) {
                            setAttributes({ buttonUrl: val });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: 'bold' } }, 'Button Background Color'),
                    el(ColorPalette, {
                        value: attrs.buttonBgColor,
                        onChange: function (val) {
                            setAttributes({ buttonBgColor: val || '#e94560' });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: 'bold' } }, 'Button Text Color'),
                    el(ColorPalette, {
                        value: attrs.buttonTextColor,
                        onChange: function (val) {
                            setAttributes({ buttonTextColor: val || '#ffffff' });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Button Border Radius',
                        value: attrs.buttonBorderRadius,
                        onChange: function (val) {
                            setAttributes({ buttonBorderRadius: val });
                        },
                        min: 0,
                        max: 50,
                    }),
                    el(TextControl, {
                        label: 'Secondary Link Text',
                        value: attrs.secondaryText,
                        onChange: function (val) {
                            setAttributes({ secondaryText: val });
                        },
                    }),
                    el(TextControl, {
                        label: 'Secondary Link URL',
                        value: attrs.secondaryUrl,
                        onChange: function (val) {
                            setAttributes({ secondaryUrl: val });
                        },
                    })
                ),

                // Background Panel
                el(
                    PanelBody,
                    { title: 'Background & Spacing', initialOpen: false },
                    el('p', { style: { marginBottom: '8px', fontWeight: 'bold' } }, 'Background Color'),
                    el(ColorPalette, {
                        value: attrs.backgroundColor,
                        onChange: function (val) {
                            setAttributes({ backgroundColor: val || '#ffffff' });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: 'bold' } }, 'Text Color'),
                    el(ColorPalette, {
                        value: attrs.textColor,
                        onChange: function (val) {
                            setAttributes({ textColor: val || '#333333' });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Border Radius',
                        value: attrs.borderRadius,
                        onChange: function (val) {
                            setAttributes({ borderRadius: val });
                        },
                        min: 0,
                        max: 50,
                    }),
                    el(ToggleControl, {
                        label: 'Box Shadow',
                        checked: attrs.hasShadow,
                        onChange: function (val) {
                            setAttributes({ hasShadow: val });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Padding',
                        value: attrs.padding,
                        onChange: function (val) {
                            setAttributes({ padding: val });
                        },
                        min: 0,
                        max: 80,
                    }),
                    el(RangeControl, {
                        label: 'Max Width (px) \u2014 0 = none',
                        value: attrs.maxWidth,
                        onChange: function (val) {
                            setAttributes({ maxWidth: val });
                        },
                        min: 0,
                        max: 800,
                        step: 10,
                    }),
                    el('p', { style: { marginBottom: '8px', marginTop: '16px', fontWeight: 'bold' } }, 'Background Image'),
                    el(
                        MediaUploadCheck,
                        null,
                        el(MediaUpload, {
                            onSelect: function (media) {
                                setAttributes({
                                    backgroundImage: {
                                        id: media.id,
                                        url: media.url,
                                        alt: media.alt || '',
                                    },
                                });
                            },
                            allowedTypes: ['image'],
                            value: attrs.backgroundImage ? attrs.backgroundImage.id : undefined,
                            render: function (obj) {
                                return el(
                                    Fragment,
                                    null,
                                    attrs.backgroundImage && attrs.backgroundImage.url
                                        ? el(
                                            'div',
                                            { style: { marginBottom: '12px' } },
                                            el('img', {
                                                src: attrs.backgroundImage.url,
                                                alt: attrs.backgroundImage.alt || '',
                                                style: { maxWidth: '100%', maxHeight: '120px', display: 'block', marginBottom: '8px', objectFit: 'cover' },
                                            }),
                                            el(
                                                Button,
                                                {
                                                    onClick: obj.open,
                                                    variant: 'secondary',
                                                    isSmall: true,
                                                    style: { marginRight: '8px' },
                                                },
                                                'Replace Image'
                                            ),
                                            el(
                                                Button,
                                                {
                                                    onClick: function () {
                                                        setAttributes({ backgroundImage: {} });
                                                    },
                                                    variant: 'tertiary',
                                                    isSmall: true,
                                                    isDestructive: true,
                                                },
                                                'Remove'
                                            )
                                        )
                                        : el(
                                            Button,
                                            {
                                                onClick: obj.open,
                                                variant: 'secondary',
                                            },
                                            'Upload Background Image'
                                        )
                                );
                            },
                        })
                    ),
                    el(SelectControl, {
                        label: 'Background Attachment',
                        value: attrs.backgroundAttachment,
                        options: [
                            { label: 'Scroll', value: 'scroll' },
                            { label: 'Fixed', value: 'fixed' },
                        ],
                        onChange: function (val) {
                            setAttributes({ backgroundAttachment: val });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Horizontal Margin (px)',
                        value: attrs.marginX,
                        onChange: function (v) {
                            setAttributes({ marginX: v });
                        },
                        min: 0,
                        max: 80,
                        step: 2,
                    })
                )
            );

            var blockProps = useBlockProps({ className: 'atx-cta-banner-block', style: containerStyle });

            // Editor preview
            return el(
                Fragment,
                null,
                inspector,
                el(
                    'div',
                    blockProps,

                    // Icon / Image area
                    isImageLayout
                        ? (attrs.iconImage && attrs.iconImage.url
                            ? el('div', { style: iconAreaStyle }, iconEl)
                            : el('div', { style: Object.assign({}, iconAreaStyle, { background: '#eee', minHeight: '180px' }) },
                                el('span', { style: { color: '#999', fontSize: '14px' } }, 'Select an image in the Icon panel')
                            ))
                        : (attrs.iconType !== 'none'
                            ? el('div', { style: iconAreaStyle }, iconEl)
                            : null),

                    // Content area
                    el(
                        'div',
                        { style: contentAreaStyle },
                        el(RichText, {
                            tagName: 'h3',
                            value: attrs.heading,
                            onChange: function (val) {
                                setAttributes({ heading: val });
                            },
                            placeholder: 'Heading...',
                            style: {
                                color: attrs.textColor,
                                margin: '0 0 8px 0',
                            },
                        }),
                        el(RichText, {
                            tagName: 'p',
                            value: attrs.description,
                            onChange: function (val) {
                                setAttributes({ description: val });
                            },
                            placeholder: 'Description text...',
                            style: {
                                color: attrs.textColor,
                                margin: '0 0 12px 0',
                                opacity: 0.85,
                            },
                        }),
                        el(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: (attrs.layout === 'vertical' || attrs.layout === 'image-top' || attrs.layout === 'image-bottom') ? 'center' : 'flex-start' } },
                            el(
                                'span',
                                { style: buttonStyle },
                                el(RichText, {
                                    tagName: 'span',
                                    value: attrs.buttonText,
                                    onChange: function (val) {
                                        setAttributes({ buttonText: val });
                                    },
                                    placeholder: 'Button text...',
                                    style: { color: attrs.buttonTextColor },
                                })
                            ),
                            attrs.secondaryText
                                ? el(
                                    'span',
                                    {
                                        style: {
                                            color: attrs.buttonBgColor,
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                        },
                                    },
                                    attrs.secondaryText
                                )
                                : null
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attrs = props.attributes;
            var isImageLayout = attrs.layout.indexOf('image-') === 0;

            var flexDir = 'row';
            if (attrs.layout === 'vertical' || attrs.layout === 'image-top') flexDir = 'column';
            else if (attrs.layout === 'horizontal' || attrs.layout === 'image-left') flexDir = 'row';
            else if (attrs.layout === 'image-right') flexDir = 'row-reverse';
            else if (attrs.layout === 'image-bottom') flexDir = 'column-reverse';

            var containerStyle = {
                display: 'flex',
                flexDirection: flexDir,
                alignItems: (attrs.layout === 'horizontal' || attrs.layout === 'vertical') ? 'center' : 'stretch',
                gap: isImageLayout ? '0px' : '20px',
                backgroundColor: attrs.backgroundColor,
                color: attrs.textColor,
                borderRadius: attrs.borderRadius + 'px',
                padding: isImageLayout ? '0px' : attrs.padding + 'px',
                boxShadow: attrs.hasShadow ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                overflow: 'hidden',
            };
            if (attrs.maxWidth > 0) {
                containerStyle.maxWidth = attrs.maxWidth + 'px';
                containerStyle.marginLeft = 'auto';
                containerStyle.marginRight = 'auto';
            }
            if (attrs.marginX > 0) {
                containerStyle.marginLeft = attrs.marginX + 'px';
                containerStyle.marginRight = attrs.marginX + 'px';
            }

            if (attrs.backgroundImage && attrs.backgroundImage.url) {
                containerStyle.backgroundImage = 'url(' + attrs.backgroundImage.url + ')';
                containerStyle.backgroundSize = 'cover';
                containerStyle.backgroundPosition = 'center';
                containerStyle.backgroundAttachment = attrs.backgroundAttachment;
            }

            var buttonStyle = {
                display: 'inline-block',
                backgroundColor: attrs.buttonBgColor,
                color: attrs.buttonTextColor,
                padding: '10px 24px',
                borderRadius: attrs.buttonBorderRadius + 'px',
                textDecoration: 'none',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
            };

            var contentStyle = {
                flex: 1,
                textAlign: (attrs.layout === 'vertical' || attrs.layout === 'image-top' || attrs.layout === 'image-bottom') ? 'center' : 'left',
            };

            if (isImageLayout) {
                contentStyle.padding = attrs.padding + 'px';
            }

            // Icon / Image element
            var iconEl = null;
            if (isImageLayout && attrs.iconImage && attrs.iconImage.url) {
                iconEl = el('img', {
                    src: attrs.iconImage.url,
                    alt: attrs.iconImage.alt || '',
                    style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        minHeight: '180px',
                        display: 'block',
                    },
                });
            } else if (attrs.iconType === 'dashicon') {
                iconEl = el('span', {
                    className: 'dashicons dashicons-' + attrs.dashicon,
                    'aria-hidden': 'true',
                    style: {
                        fontSize: attrs.iconSize + 'px',
                        width: attrs.iconSize + 'px',
                        height: attrs.iconSize + 'px',
                        color: attrs.iconColor,
                    },
                });
            } else if (attrs.iconType === 'image' && attrs.iconImage && attrs.iconImage.url) {
                iconEl = el('img', {
                    src: attrs.iconImage.url,
                    alt: attrs.iconImage.alt || '',
                    style: {
                        width: attrs.iconSize + 'px',
                        height: attrs.iconSize + 'px',
                        objectFit: 'contain',
                    },
                });
            }

            // Buttons area
            var buttonsArea = el(
                'div',
                {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginTop: '12px',
                        justifyContent: (attrs.layout === 'vertical' || attrs.layout === 'image-top' || attrs.layout === 'image-bottom') ? 'center' : 'flex-start',
                    },
                },
                el(
                    'a',
                    {
                        className: 'atx-cta-banner-button',
                        href: attrs.buttonUrl,
                        style: buttonStyle,
                    },
                    el(RichText.Content, { value: attrs.buttonText })
                ),
                attrs.secondaryText && attrs.secondaryUrl
                    ? el(
                        'a',
                        {
                            className: 'atx-cta-banner-secondary',
                            href: attrs.secondaryUrl,
                            style: {
                                color: attrs.buttonBgColor,
                                textDecoration: 'underline',
                                fontWeight: '500',
                            },
                        },
                        attrs.secondaryText
                    )
                    : null
            );

            var blockProps = useBlockProps.save({ className: 'atx-cta-banner-block', style: containerStyle });

            return el(
                'div',
                blockProps,

                // Icon / Image area
                isImageLayout
                    ? (iconEl
                        ? el('div', { style: { flex: '0 0 50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: (attrs.layout === 'image-left' || attrs.layout === 'image-right') ? '180px' : undefined } }, iconEl)
                        : null)
                    : (attrs.iconType !== 'none' && iconEl
                        ? el('div', { style: { flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, iconEl)
                        : null),

                // Content area
                el(
                    'div',
                    { style: contentStyle },
                    el(RichText.Content, {
                        tagName: 'h3',
                        value: attrs.heading,
                        style: { color: attrs.textColor, margin: '0 0 8px 0' },
                    }),
                    el(RichText.Content, {
                        tagName: 'p',
                        value: attrs.description,
                        style: { color: attrs.textColor, margin: '0 0 4px 0', opacity: 0.85 },
                    }),
                    buttonsArea
                )
            );
        },
    });
})();
