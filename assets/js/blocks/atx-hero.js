(function () {
    const { registerBlockType } = wp.blocks;
    const el = wp.element.createElement;
    const { Fragment } = wp.element;
    const {
        InspectorControls,
        MediaUpload,
        MediaUploadCheck,
        InnerBlocks,
        useBlockProps,
    } = wp.blockEditor;
    const {
        PanelBody,
        Button,
        RangeControl,
        SelectControl,
        ColorPalette,
    } = wp.components;

    // Default template — users can delete, reorder, or add any block
    var TEMPLATE = [
        ['core/heading', {
            level: 2,
            content: 'Your Headline Here',
            textColor: 'white',
            style: { typography: { fontSize: '36px', fontWeight: '700' } },
        }],
        ['core/paragraph', {
            content: 'Add a compelling message to engage your visitors.',
            textColor: 'white',
            style: { typography: { fontSize: '18px' } },
        }],
        ['core/buttons', { layout: { type: 'flex', justifyContent: 'center' } }, [
            ['core/button', {
                text: 'Get Started',
                backgroundColor: '#e94560',
                textColor: 'white',
            }],
        ]],
    ];

    registerBlockType('atx-popup/hero', {
        title: 'ATX Hero',
        description:
            'Full-width hero section with background media. Add any blocks inside — heading, text, buttons, sliders, images.',
        icon: 'cover-image',
        category: 'atx-popup',
        attributes: {
            backgroundImage: {
                type: 'object',
                default: {},
            },
            backgroundType: {
                type: 'string',
                default: 'image',
            },
            backgroundColor: {
                type: 'string',
                default: '#1a1a2e',
            },
            overlayColor: {
                type: 'string',
                default: 'rgba(0,0,0,0.4)',
            },
            overlayOpacity: {
                type: 'number',
                default: 40,
            },
            textAlign: {
                type: 'string',
                default: 'center',
            },
            minHeight: {
                type: 'number',
                default: 300,
            },
            paddingTop: {
                type: 'number',
                default: 40,
            },
            paddingBottom: {
                type: 'number',
                default: 40,
            },
            verticalAlign: {
                type: 'string',
                default: 'center',
            },
            backgroundAttachment: {
                type: 'string',
                default: 'scroll',
            },
            backgroundPosition: {
                type: 'string',
                default: 'center center',
            },
            contentMaxWidth: {
                type: 'number',
                default: 800,
            },
            marginX: {
                type: 'number',
                default: 0,
            },
        },

        edit: function (props) {
            var attrs = props.attributes;
            var setAttributes = props.setAttributes;

            var verticalAlignMap = {
                top: 'flex-start',
                center: 'center',
                bottom: 'flex-end',
            };

            var hasImage = attrs.backgroundImage && attrs.backgroundImage.url && attrs.backgroundType !== 'video';
            var hasVideo = attrs.backgroundImage && attrs.backgroundImage.url && attrs.backgroundType === 'video';

            var wrapperStyle = {
                position: 'relative',
                minHeight: attrs.minHeight + 'px',
                paddingTop: attrs.paddingTop + 'px',
                paddingBottom: attrs.paddingBottom + 'px',
                backgroundColor: attrs.backgroundColor,
                backgroundImage: hasImage ? 'url(' + attrs.backgroundImage.url + ')' : 'none',
                backgroundSize: 'cover',
                backgroundPosition: attrs.backgroundPosition,
                backgroundAttachment: attrs.backgroundAttachment,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: verticalAlignMap[attrs.verticalAlign] || 'center',
                alignItems: 'center',
                textAlign: attrs.textAlign,
                overflow: 'hidden',
                borderRadius: '4px',
            };

            if (attrs.marginX > 0) { wrapperStyle.marginLeft = attrs.marginX + 'px'; wrapperStyle.marginRight = attrs.marginX + 'px'; }

            var blockProps = useBlockProps({
                className: 'atx-hero-block',
                style: wrapperStyle,
            });

            var overlayStyle = {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: attrs.overlayColor,
                opacity: attrs.overlayOpacity / 100,
                zIndex: 1,
                pointerEvents: 'none',
            };

            var contentStyle = {
                position: 'relative',
                zIndex: 2,
                width: '100%',
                maxWidth: attrs.contentMaxWidth + 'px',
                padding: '0 20px',
                boxSizing: 'border-box',
            };

            // Inspector controls
            var inspectorControls = el(
                InspectorControls,
                null,
                // Background panel
                el(
                    PanelBody,
                    { title: 'Background', initialOpen: true },
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Background Color'),
                    el(ColorPalette, {
                        value: attrs.backgroundColor,
                        onChange: function (value) {
                            setAttributes({ backgroundColor: value || '#1a1a2e' });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Background Image / Video'),
                    el(
                        MediaUploadCheck,
                        null,
                        el(MediaUpload, {
                            onSelect: function (media) {
                                var type = (media.type || media.mime || '').indexOf('video') !== -1 ? 'video' : 'image';
                                setAttributes({
                                    backgroundImage: { id: media.id, url: media.url, alt: media.alt || '' },
                                    backgroundType: type,
                                });
                            },
                            allowedTypes: ['image', 'video'],
                            value: attrs.backgroundImage && attrs.backgroundImage.id ? attrs.backgroundImage.id : undefined,
                            render: function (obj) {
                                return el(
                                    Fragment,
                                    null,
                                    attrs.backgroundImage && attrs.backgroundImage.url
                                        ? el(
                                              'div',
                                              { style: { marginBottom: '10px' } },
                                              attrs.backgroundType === 'video'
                                                  ? el('video', {
                                                      src: attrs.backgroundImage.url,
                                                      style: { maxWidth: '100%', height: 'auto', borderRadius: '4px' },
                                                      muted: true, loop: true, autoPlay: true, playsInline: true,
                                                  })
                                                  : el('img', {
                                                      src: attrs.backgroundImage.url,
                                                      alt: attrs.backgroundImage.alt || '',
                                                      style: { maxWidth: '100%', height: 'auto', borderRadius: '4px' },
                                                  }),
                                              el('small', { style: { display: 'block', marginTop: '4px', opacity: 0.7 } }, 'Type: ' + attrs.backgroundType),
                                              el(Button, {
                                                  isDestructive: true, isSmall: true,
                                                  onClick: function () { setAttributes({ backgroundImage: {}, backgroundType: 'image' }); },
                                                  style: { marginTop: '8px' },
                                              }, 'Remove Media')
                                          )
                                        : null,
                                    el(Button, {
                                        isSecondary: true, onClick: obj.open,
                                    }, attrs.backgroundImage && attrs.backgroundImage.url ? 'Replace Media' : 'Select Image or Video')
                                );
                            },
                        })
                    ),
                    el(SelectControl, {
                        label: 'Background Position',
                        value: attrs.backgroundPosition,
                        options: [
                            { label: 'Center Center', value: 'center center' },
                            { label: 'Top Center', value: 'top center' },
                            { label: 'Bottom Center', value: 'bottom center' },
                            { label: 'Left Center', value: 'left center' },
                            { label: 'Right Center', value: 'right center' },
                            { label: 'Top Left', value: 'top left' },
                            { label: 'Top Right', value: 'top right' },
                            { label: 'Bottom Left', value: 'bottom left' },
                            { label: 'Bottom Right', value: 'bottom right' },
                        ],
                        onChange: function (value) { setAttributes({ backgroundPosition: value }); },
                    }),
                    el(SelectControl, {
                        label: 'Background Attachment',
                        value: attrs.backgroundAttachment,
                        options: [
                            { label: 'Scroll (normal)', value: 'scroll' },
                            { label: 'Fixed (parallax)', value: 'fixed' },
                        ],
                        onChange: function (value) { setAttributes({ backgroundAttachment: value }); },
                    })
                ),
                // Overlay panel
                el(
                    PanelBody,
                    { title: 'Overlay', initialOpen: false },
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Overlay Color'),
                    el(ColorPalette, {
                        value: attrs.overlayColor,
                        onChange: function (value) { setAttributes({ overlayColor: value || 'rgba(0,0,0,0.4)' }); },
                    }),
                    el(RangeControl, {
                        label: 'Overlay Opacity (%)',
                        value: attrs.overlayOpacity,
                        onChange: function (value) { setAttributes({ overlayOpacity: value }); },
                        min: 0, max: 100, step: 1,
                    })
                ),
                // Layout panel
                el(
                    PanelBody,
                    { title: 'Layout', initialOpen: false },
                    el(RangeControl, {
                        label: 'Min Height (px)',
                        value: attrs.minHeight,
                        onChange: function (value) { setAttributes({ minHeight: value }); },
                        min: 100, max: 1000, step: 10,
                    }),
                    el(RangeControl, {
                        label: 'Content Max Width (px)',
                        value: attrs.contentMaxWidth,
                        onChange: function (value) { setAttributes({ contentMaxWidth: value }); },
                        min: 300, max: 1200, step: 10,
                    }),
                    el(RangeControl, {
                        label: 'Horizontal Margin (px)',
                        value: attrs.marginX,
                        onChange: function (v) { setAttributes({ marginX: v }); },
                        min: 0, max: 80, step: 2,
                    }),
                    el(RangeControl, {
                        label: 'Padding Top (px)',
                        value: attrs.paddingTop,
                        onChange: function (value) { setAttributes({ paddingTop: value }); },
                        min: 0, max: 200, step: 5,
                    }),
                    el(RangeControl, {
                        label: 'Padding Bottom (px)',
                        value: attrs.paddingBottom,
                        onChange: function (value) { setAttributes({ paddingBottom: value }); },
                        min: 0, max: 200, step: 5,
                    }),
                    el(SelectControl, {
                        label: 'Text Alignment',
                        value: attrs.textAlign,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' },
                        ],
                        onChange: function (value) { setAttributes({ textAlign: value }); },
                    }),
                    el(SelectControl, {
                        label: 'Vertical Alignment',
                        value: attrs.verticalAlign,
                        options: [
                            { label: 'Top', value: 'top' },
                            { label: 'Center', value: 'center' },
                            { label: 'Bottom', value: 'bottom' },
                        ],
                        onChange: function (value) { setAttributes({ verticalAlign: value }); },
                    })
                )
            );

            // Video background element for editor
            var videoBackground = hasVideo
                ? el('video', {
                      src: attrs.backgroundImage.url,
                      autoPlay: true, muted: true, loop: true, playsInline: true,
                      style: {
                          position: 'absolute', top: '0', left: '0',
                          width: '100%', height: '100%', objectFit: 'cover', zIndex: 0,
                      },
                  })
                : null;

            // Block preview
            var blockPreview = el(
                'div',
                blockProps,
                videoBackground,
                el('div', { className: 'atx-hero-overlay', style: overlayStyle }),
                el(
                    'div',
                    { className: 'atx-hero-content', style: contentStyle },
                    el(InnerBlocks, {
                        template: TEMPLATE,
                        templateLock: false,
                    })
                )
            );

            return el(Fragment, null, inspectorControls, blockPreview);
        },

        save: function (props) {
            var attrs = props.attributes;

            var verticalAlignMap = {
                top: 'flex-start',
                center: 'center',
                bottom: 'flex-end',
            };

            var saveHasImage = attrs.backgroundImage && attrs.backgroundImage.url && attrs.backgroundType !== 'video';
            var saveHasVideo = attrs.backgroundImage && attrs.backgroundImage.url && attrs.backgroundType === 'video';

            var wrapperStyle = {
                position: 'relative',
                minHeight: attrs.minHeight + 'px',
                paddingTop: attrs.paddingTop + 'px',
                paddingBottom: attrs.paddingBottom + 'px',
                backgroundColor: attrs.backgroundColor,
                backgroundImage: saveHasImage ? 'url(' + attrs.backgroundImage.url + ')' : 'none',
                backgroundSize: 'cover',
                backgroundPosition: attrs.backgroundPosition,
                backgroundAttachment: attrs.backgroundAttachment,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: verticalAlignMap[attrs.verticalAlign] || 'center',
                alignItems: 'center',
                textAlign: attrs.textAlign,
                overflow: 'hidden',
            };

            if (attrs.marginX > 0) { wrapperStyle.marginLeft = attrs.marginX + 'px'; wrapperStyle.marginRight = attrs.marginX + 'px'; }

            var blockProps = useBlockProps.save({
                className: 'atx-hero-block',
                style: wrapperStyle,
            });

            var overlayStyle = {
                position: 'absolute',
                top: '0', left: '0', right: '0', bottom: '0',
                backgroundColor: attrs.overlayColor,
                opacity: attrs.overlayOpacity / 100,
                zIndex: '1',
                pointerEvents: 'none',
            };

            var contentStyle = {
                position: 'relative',
                zIndex: '2',
                width: '100%',
                maxWidth: attrs.contentMaxWidth + 'px',
                padding: '0 20px',
                boxSizing: 'border-box',
            };

            // Video background for save
            var saveVideoEl = saveHasVideo
                ? el('video', {
                      className: 'atx-hero-video',
                      src: attrs.backgroundImage.url,
                      autoPlay: true, muted: true, loop: true, playsInline: true,
                      'aria-hidden': 'true',
                      style: {
                          position: 'absolute', top: '0', left: '0',
                          width: '100%', height: '100%', objectFit: 'cover', zIndex: '0',
                      },
                  })
                : null;

            return el(
                'div',
                blockProps,
                saveVideoEl,
                el('div', { className: 'atx-hero-overlay', style: overlayStyle, 'aria-hidden': 'true' }),
                el(
                    'div',
                    { className: 'atx-hero-content', style: contentStyle },
                    el(InnerBlocks.Content)
                )
            );
        },
    });
})();
