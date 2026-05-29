(function () {
    const { registerBlockType } = wp.blocks;
    const el = wp.element.createElement;
    const { Fragment } = wp.element;
    const {
        InspectorControls,
        RichText,
        MediaUpload,
        MediaUploadCheck,
        useBlockProps,
    } = wp.blockEditor;
    const {
        PanelBody,
        Button,
        RangeControl,
        SelectControl,
        ToggleControl,
        ColorPalette,
        TextControl,
    } = wp.components;

    registerBlockType('atx-popup/newsletter', {
        title: 'ATX Newsletter',
        description:
            'Email signup form with heading, description, and customizable input.',
        icon: 'email',
        category: 'atx-popup',
        attributes: {
            heading: {
                type: 'string',
                default: 'Stay in the Loop',
            },
            description: {
                type: 'string',
                default:
                    'Subscribe to our newsletter for updates and exclusive offers.',
            },
            emailPlaceholder: {
                type: 'string',
                default: 'Enter your email',
            },
            namePlaceholder: {
                type: 'string',
                default: 'Your name',
            },
            showNameField: {
                type: 'boolean',
                default: false,
            },
            buttonText: {
                type: 'string',
                default: 'Subscribe',
            },
            formAction: {
                type: 'string',
                default: '',
            },
            formLayout: {
                type: 'string',
                default: 'stacked',
            },
            buttonBgColor: {
                type: 'string',
                default: '#e94560',
            },
            buttonTextColor: {
                type: 'string',
                default: '#ffffff',
            },
            buttonBorderRadius: {
                type: 'number',
                default: 4,
            },
            inputBorderColor: {
                type: 'string',
                default: '#dddddd',
            },
            inputBorderRadius: {
                type: 'number',
                default: 4,
            },
            backgroundColor: {
                type: 'string',
                default: '#f8f9fa',
            },
            textColor: {
                type: 'string',
                default: '#333333',
            },
            textAlign: {
                type: 'string',
                default: 'center',
            },
            privacyText: {
                type: 'string',
                default:
                    'We respect your privacy. Unsubscribe at any time.',
            },
            showPrivacy: {
                type: 'boolean',
                default: true,
            },
            decorativeImage: {
                type: 'object',
                default: {},
            },
            imagePosition: {
                type: 'string',
                default: 'top',
            },
            backgroundImage: {
                type: 'object',
                default: {},
            },
            backgroundAttachment: {
                type: 'string',
                default: 'scroll',
            },
            padding: {
                type: 'number',
                default: 30,
            },
            maxWidth: {
                type: 'number',
                default: 0,
            },
            marginX: {
                type: 'number',
                default: 0,
            },
            borderRadius: {
                type: 'number',
                default: 8,
            },
        },

        edit: function (props) {
            var attrs = props.attributes;
            var setAttributes = props.setAttributes;

            var wrapperStyle = {
                backgroundColor: attrs.backgroundColor,
                padding: attrs.padding + 'px',
                borderRadius: attrs.borderRadius + 'px',
                textAlign: attrs.textAlign,
                overflow: 'hidden',
            };
            if (attrs.maxWidth > 0) {
                wrapperStyle.maxWidth = attrs.maxWidth + 'px';
                wrapperStyle.marginLeft = 'auto';
                wrapperStyle.marginRight = 'auto';
            }
            if (attrs.marginX > 0) {
                wrapperStyle.marginLeft = attrs.marginX + 'px';
                wrapperStyle.marginRight = attrs.marginX + 'px';
            }

            if (attrs.backgroundImage && attrs.backgroundImage.url) {
                wrapperStyle.backgroundImage = 'url(' + attrs.backgroundImage.url + ')';
                wrapperStyle.backgroundSize = 'cover';
                wrapperStyle.backgroundPosition = 'center';
                wrapperStyle.backgroundAttachment = attrs.backgroundAttachment || 'scroll';
            }

            var isSideLayout = attrs.imagePosition === 'left' || attrs.imagePosition === 'right';

            var headingStyle = {
                color: attrs.textColor,
                fontSize: '28px',
                fontWeight: '700',
                lineHeight: '1.2',
                marginBottom: '12px',
                marginTop: '0',
            };

            var descriptionStyle = {
                color: attrs.textColor,
                fontSize: '16px',
                lineHeight: '1.5',
                marginBottom: '20px',
                opacity: '0.85',
            };

            var inputStyle = {
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid ' + attrs.inputBorderColor,
                borderRadius: attrs.inputBorderRadius + 'px',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
            };

            var buttonStyle = {
                display: 'inline-block',
                backgroundColor: attrs.buttonBgColor,
                color: attrs.buttonTextColor,
                padding: '10px 24px',
                borderRadius: attrs.buttonBorderRadius + 'px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
            };

            var isInline = attrs.formLayout === 'inline';

            var formRowStyle = {
                display: isInline ? 'flex' : 'block',
                gap: isInline ? '8px' : '0',
                alignItems: isInline ? 'stretch' : undefined,
                justifyContent: attrs.textAlign === 'center' ? 'center' : 'flex-start',
            };

            var inputWrapperStyle = {
                flex: isInline ? '1' : undefined,
                marginBottom: isInline ? '0' : '10px',
            };

            var buttonWrapperStyle = {
                marginTop: isInline ? '0' : '0',
            };

            if (isInline) {
                buttonStyle.width = 'auto';
            } else {
                buttonStyle.width = '100%';
            }

            var privacyStyle = {
                color: attrs.textColor,
                fontSize: '12px',
                opacity: '0.65',
                marginTop: '12px',
            };

            var decorativeImageStyle;
            if (isSideLayout) {
                decorativeImageStyle = {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    minHeight: '200px',
                    display: 'block',
                };
            } else {
                decorativeImageStyle = {
                    maxWidth: '80px',
                    height: 'auto',
                    marginBottom: '16px',
                    display: attrs.textAlign === 'center' ? 'block' : 'inline-block',
                    marginLeft: attrs.textAlign === 'center' ? 'auto' : undefined,
                    marginRight: attrs.textAlign === 'center' ? 'auto' : undefined,
                };
            }

            // Inspector controls
            var inspectorControls = el(
                InspectorControls,
                null,
                // Form Settings panel
                el(
                    PanelBody,
                    { title: 'Form Settings', initialOpen: true },
                    el(TextControl, {
                        label: 'Form Action URL',
                        value: attrs.formAction,
                        onChange: function (value) {
                            setAttributes({ formAction: value });
                        },
                        help: 'Enter your Mailchimp or newsletter service form action URL.',
                    }),
                    el(SelectControl, {
                        label: 'Layout',
                        value: attrs.formLayout,
                        options: [
                            { label: 'Stacked', value: 'stacked' },
                            { label: 'Inline', value: 'inline' },
                        ],
                        onChange: function (value) {
                            setAttributes({ formLayout: value });
                        },
                    }),
                    el(ToggleControl, {
                        label: 'Show Name Field',
                        checked: attrs.showNameField,
                        onChange: function (value) {
                            setAttributes({ showNameField: value });
                        },
                    }),
                    el(TextControl, {
                        label: 'Email Placeholder',
                        value: attrs.emailPlaceholder,
                        onChange: function (value) {
                            setAttributes({ emailPlaceholder: value });
                        },
                    }),
                    el(TextControl, {
                        label: 'Name Placeholder',
                        value: attrs.namePlaceholder,
                        onChange: function (value) {
                            setAttributes({ namePlaceholder: value });
                        },
                    }),
                    el(SelectControl, {
                        label: 'Text Alignment',
                        value: attrs.textAlign,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' },
                        ],
                        onChange: function (value) {
                            setAttributes({ textAlign: value });
                        },
                    }),
                    el(ToggleControl, {
                        label: 'Show Privacy Text',
                        checked: attrs.showPrivacy,
                        onChange: function (value) {
                            setAttributes({ showPrivacy: value });
                        },
                    })
                ),
                // Button Style panel
                el(
                    PanelBody,
                    { title: 'Button Style', initialOpen: false },
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Button Background Color'),
                    el(ColorPalette, {
                        value: attrs.buttonBgColor,
                        onChange: function (value) {
                            setAttributes({
                                buttonBgColor: value || '#e94560',
                            });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Button Text Color'),
                    el(ColorPalette, {
                        value: attrs.buttonTextColor,
                        onChange: function (value) {
                            setAttributes({
                                buttonTextColor: value || '#ffffff',
                            });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Button Border Radius (px)',
                        value: attrs.buttonBorderRadius,
                        onChange: function (value) {
                            setAttributes({ buttonBorderRadius: value });
                        },
                        min: 0,
                        max: 50,
                        step: 1,
                    })
                ),
                // Input Style panel
                el(
                    PanelBody,
                    { title: 'Input Style', initialOpen: false },
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Input Border Color'),
                    el(ColorPalette, {
                        value: attrs.inputBorderColor,
                        onChange: function (value) {
                            setAttributes({
                                inputBorderColor: value || '#dddddd',
                            });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Input Border Radius (px)',
                        value: attrs.inputBorderRadius,
                        onChange: function (value) {
                            setAttributes({ inputBorderRadius: value });
                        },
                        min: 0,
                        max: 50,
                        step: 1,
                    })
                ),
                // Background panel
                el(
                    PanelBody,
                    { title: 'Background', initialOpen: false },
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Background Color'),
                    el(ColorPalette, {
                        value: attrs.backgroundColor,
                        onChange: function (value) {
                            setAttributes({
                                backgroundColor: value || '#f8f9fa',
                            });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Text Color'),
                    el(ColorPalette, {
                        value: attrs.textColor,
                        onChange: function (value) {
                            setAttributes({
                                textColor: value || '#333333',
                            });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Padding (px)',
                        value: attrs.padding,
                        onChange: function (value) {
                            setAttributes({ padding: value });
                        },
                        min: 0,
                        max: 100,
                        step: 5,
                    }),
                    el(RangeControl, {
                        label: 'Border Radius (px)',
                        value: attrs.borderRadius,
                        onChange: function (value) {
                            setAttributes({ borderRadius: value });
                        },
                        min: 0,
                        max: 50,
                        step: 1,
                    }),
                    el(RangeControl, {
                        label: 'Max Width (px) \u2014 0 = none',
                        value: attrs.maxWidth,
                        onChange: function (value) {
                            setAttributes({ maxWidth: value });
                        },
                        min: 0,
                        max: 800,
                        step: 10,
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
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Decorative Image'),
                    el(
                        MediaUploadCheck,
                        null,
                        el(MediaUpload, {
                            onSelect: function (media) {
                                setAttributes({
                                    decorativeImage: {
                                        id: media.id,
                                        url: media.url,
                                        alt: media.alt || '',
                                    },
                                });
                            },
                            allowedTypes: ['image'],
                            value:
                                attrs.decorativeImage && attrs.decorativeImage.id
                                    ? attrs.decorativeImage.id
                                    : undefined,
                            render: function (obj) {
                                return el(
                                    Fragment,
                                    null,
                                    attrs.decorativeImage && attrs.decorativeImage.url
                                        ? el(
                                              'div',
                                              { style: { marginBottom: '10px' } },
                                              el('img', {
                                                  src: attrs.decorativeImage.url,
                                                  alt: attrs.decorativeImage.alt || '',
                                                  style: {
                                                      maxWidth: '80px',
                                                      height: 'auto',
                                                      borderRadius: '4px',
                                                  },
                                              }),
                                              el(
                                                  Button,
                                                  {
                                                      isDestructive: true,
                                                      isSmall: true,
                                                      onClick: function () {
                                                          setAttributes({
                                                              decorativeImage: {},
                                                          });
                                                      },
                                                      style: { marginTop: '8px' },
                                                  },
                                                  'Remove Image'
                                              )
                                          )
                                        : null,
                                    el(
                                        Button,
                                        {
                                            isSecondary: true,
                                            onClick: obj.open,
                                        },
                                        attrs.decorativeImage && attrs.decorativeImage.url
                                            ? 'Replace Image'
                                            : 'Select Image'
                                    )
                                );
                            },
                        })
                    ),
                    el(SelectControl, {
                        label: 'Image Position',
                        value: attrs.imagePosition,
                        options: [
                            { label: 'Top', value: 'top' },
                            { label: 'Left', value: 'left' },
                            { label: 'Right', value: 'right' },
                        ],
                        onChange: function (value) {
                            setAttributes({ imagePosition: value });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600', marginTop: '16px' } }, 'Background Image'),
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
                            value:
                                attrs.backgroundImage && attrs.backgroundImage.id
                                    ? attrs.backgroundImage.id
                                    : undefined,
                            render: function (obj) {
                                return el(
                                    Fragment,
                                    null,
                                    attrs.backgroundImage && attrs.backgroundImage.url
                                        ? el(
                                              'div',
                                              { style: { marginBottom: '10px' } },
                                              el('img', {
                                                  src: attrs.backgroundImage.url,
                                                  alt: attrs.backgroundImage.alt || '',
                                                  style: {
                                                      maxWidth: '100%',
                                                      height: 'auto',
                                                      borderRadius: '4px',
                                                  },
                                              }),
                                              el(
                                                  Button,
                                                  {
                                                      isDestructive: true,
                                                      isSmall: true,
                                                      onClick: function () {
                                                          setAttributes({
                                                              backgroundImage: {},
                                                          });
                                                      },
                                                      style: { marginTop: '8px' },
                                                  },
                                                  'Remove Background Image'
                                              )
                                          )
                                        : null,
                                    el(
                                        Button,
                                        {
                                            isSecondary: true,
                                            onClick: obj.open,
                                        },
                                        attrs.backgroundImage && attrs.backgroundImage.url
                                            ? 'Replace Background Image'
                                            : 'Select Background Image'
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
                        onChange: function (value) {
                            setAttributes({ backgroundAttachment: value });
                        },
                    })
                )
            );

            // Build form fields array
            var formFields = [];

            if (attrs.showNameField) {
                formFields.push(
                    el(
                        'div',
                        { style: inputWrapperStyle, key: 'name-field' },
                        el('input', {
                            type: 'text',
                            placeholder: attrs.namePlaceholder,
                            style: inputStyle,
                            disabled: true,
                        })
                    )
                );
            }

            formFields.push(
                el(
                    'div',
                    { style: inputWrapperStyle, key: 'email-field' },
                    el('input', {
                        type: 'email',
                        placeholder: attrs.emailPlaceholder,
                        style: inputStyle,
                        disabled: true,
                    })
                )
            );

            formFields.push(
                el(
                    'div',
                    { style: buttonWrapperStyle, key: 'submit-btn' },
                    el(RichText, {
                        tagName: 'span',
                        style: buttonStyle,
                        value: attrs.buttonText,
                        onChange: function (value) {
                            setAttributes({ buttonText: value });
                        },
                        placeholder: 'Subscribe',
                    })
                )
            );

            // Build content elements
            var headingEl = el(RichText, {
                key: 'heading',
                tagName: 'h2',
                style: headingStyle,
                value: attrs.heading,
                onChange: function (value) {
                    setAttributes({ heading: value });
                },
                placeholder: 'Stay in the Loop',
            });

            var descriptionEl = el(RichText, {
                key: 'description',
                tagName: 'p',
                style: descriptionStyle,
                value: attrs.description,
                onChange: function (value) {
                    setAttributes({ description: value });
                },
                placeholder: 'Subscribe to our newsletter...',
            });

            var formRowEl = el('div', { style: formRowStyle, key: 'form-row' }, formFields);

            var privacyEl = attrs.showPrivacy
                ? el(RichText, {
                      key: 'privacy',
                      tagName: 'small',
                      style: privacyStyle,
                      value: attrs.privacyText,
                      onChange: function (value) {
                          setAttributes({ privacyText: value });
                      },
                      placeholder: 'Privacy text...',
                  })
                : null;

            var blockProps = useBlockProps({ className: 'atx-newsletter-block', style: wrapperStyle });

            var hasDecorativeImage = attrs.decorativeImage && attrs.decorativeImage.url;

            var blockPreview;

            if (isSideLayout && hasDecorativeImage) {
                var imageArea = el(
                    'div',
                    {
                        key: 'image-area',
                        style: { flex: '0 0 45%', overflow: 'hidden' },
                    },
                    el('img', {
                        src: attrs.decorativeImage.url,
                        alt: attrs.decorativeImage.alt || '',
                        style: decorativeImageStyle,
                    })
                );

                var contentChildren = [headingEl, descriptionEl, formRowEl];
                if (privacyEl) contentChildren.push(privacyEl);

                var contentArea = el(
                    'div',
                    {
                        key: 'content-area',
                        style: { flex: '1', paddingLeft: attrs.imagePosition === 'left' ? '20px' : undefined, paddingRight: attrs.imagePosition === 'right' ? '20px' : undefined },
                    },
                    contentChildren
                );

                var flexRowStyle = {
                    display: 'flex',
                    flexDirection: attrs.imagePosition === 'right' ? 'row-reverse' : 'row',
                    alignItems: 'stretch',
                };

                blockPreview = el(
                    'div',
                    blockProps,
                    el('div', { style: flexRowStyle }, imageArea, contentArea)
                );
            } else {
                // Top position or no decorative image
                var blockContent = [];

                if (hasDecorativeImage) {
                    blockContent.push(
                        el('img', {
                            key: 'decorative-img',
                            src: attrs.decorativeImage.url,
                            alt: attrs.decorativeImage.alt || '',
                            style: decorativeImageStyle,
                        })
                    );
                }

                blockContent.push(headingEl);
                blockContent.push(descriptionEl);
                blockContent.push(formRowEl);
                if (privacyEl) blockContent.push(privacyEl);

                blockPreview = el(
                    'div',
                    blockProps,
                    blockContent
                );
            }

            return el(Fragment, null, inspectorControls, blockPreview);
        },

        save: function (props) {
            var attrs = props.attributes;

            var wrapperStyle = {
                backgroundColor: attrs.backgroundColor,
                padding: attrs.padding + 'px',
                borderRadius: attrs.borderRadius + 'px',
                textAlign: attrs.textAlign,
                overflow: 'hidden',
            };
            if (attrs.maxWidth > 0) {
                wrapperStyle.maxWidth = attrs.maxWidth + 'px';
                wrapperStyle.marginLeft = 'auto';
                wrapperStyle.marginRight = 'auto';
            }
            if (attrs.marginX > 0) {
                wrapperStyle.marginLeft = attrs.marginX + 'px';
                wrapperStyle.marginRight = attrs.marginX + 'px';
            }

            if (attrs.backgroundImage && attrs.backgroundImage.url) {
                wrapperStyle.backgroundImage = 'url(' + attrs.backgroundImage.url + ')';
                wrapperStyle.backgroundSize = 'cover';
                wrapperStyle.backgroundPosition = 'center';
                wrapperStyle.backgroundAttachment = attrs.backgroundAttachment || 'scroll';
            }

            var isSideLayout = attrs.imagePosition === 'left' || attrs.imagePosition === 'right';

            var headingStyle = {
                color: attrs.textColor,
                fontSize: '28px',
                fontWeight: '700',
                lineHeight: '1.2',
                marginBottom: '12px',
                marginTop: '0',
            };

            var descriptionStyle = {
                color: attrs.textColor,
                fontSize: '16px',
                lineHeight: '1.5',
                marginBottom: '20px',
                opacity: '0.85',
            };

            var inputStyle = {
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid ' + attrs.inputBorderColor,
                borderRadius: attrs.inputBorderRadius + 'px',
                width: '100%',
                boxSizing: 'border-box',
            };

            var isInline = attrs.formLayout === 'inline';

            var formRowStyle = {
                display: isInline ? 'flex' : 'block',
                gap: isInline ? '8px' : '0',
                alignItems: isInline ? 'stretch' : undefined,
                justifyContent: attrs.textAlign === 'center' ? 'center' : 'flex-start',
            };

            var inputWrapperStyle = {
                flex: isInline ? '1' : undefined,
                marginBottom: isInline ? '0' : '10px',
            };

            var buttonStyle = {
                display: 'inline-block',
                backgroundColor: attrs.buttonBgColor,
                color: attrs.buttonTextColor,
                padding: '10px 24px',
                borderRadius: attrs.buttonBorderRadius + 'px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                width: isInline ? 'auto' : '100%',
            };

            var privacyStyle = {
                color: attrs.textColor,
                fontSize: '12px',
                opacity: '0.65',
                marginTop: '12px',
                display: 'block',
            };

            var decorativeImageStyle;
            if (isSideLayout) {
                decorativeImageStyle = {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    minHeight: '200px',
                    display: 'block',
                };
            } else {
                decorativeImageStyle = {
                    maxWidth: '80px',
                    height: 'auto',
                    marginBottom: '16px',
                    display: attrs.textAlign === 'center' ? 'block' : 'inline-block',
                    marginLeft: attrs.textAlign === 'center' ? 'auto' : undefined,
                    marginRight: attrs.textAlign === 'center' ? 'auto' : undefined,
                };
            }

            // Build form fields
            var formFields = [];

            if (attrs.showNameField) {
                formFields.push(
                    el(
                        'div',
                        { style: inputWrapperStyle, key: 'name-field' },
                        el('input', {
                            type: 'text',
                            name: 'name',
                            placeholder: attrs.namePlaceholder,
                            'aria-label': attrs.namePlaceholder || 'Your name',
                            style: inputStyle,
                        })
                    )
                );
            }

            formFields.push(
                el(
                    'div',
                    { style: inputWrapperStyle, key: 'email-field' },
                    el('input', {
                        type: 'email',
                        name: 'email',
                        placeholder: attrs.emailPlaceholder,
                        'aria-label': attrs.emailPlaceholder || 'Enter your email',
                        style: inputStyle,
                        required: true,
                    })
                )
            );

            formFields.push(
                el(
                    'div',
                    { key: 'submit-btn' },
                    el(
                        'button',
                        {
                            type: 'submit',
                            className: 'atx-newsletter-submit',
                            style: buttonStyle,
                        },
                        el(RichText.Content, {
                            tagName: 'span',
                            value: attrs.buttonText,
                        })
                    )
                )
            );

            // Build content elements
            var headingEl = el(RichText.Content, {
                key: 'heading',
                tagName: 'h2',
                style: headingStyle,
                value: attrs.heading,
            });

            var descriptionEl = el(RichText.Content, {
                key: 'description',
                tagName: 'p',
                style: descriptionStyle,
                value: attrs.description,
            });

            var formEl = el(
                'form',
                {
                    key: 'form',
                    action: attrs.formAction,
                    method: 'post',
                    'aria-label': 'Newsletter signup',
                },
                el('div', { style: formRowStyle }, formFields)
            );

            var privacyEl = attrs.showPrivacy
                ? el(RichText.Content, {
                      key: 'privacy',
                      tagName: 'small',
                      style: privacyStyle,
                      value: attrs.privacyText,
                  })
                : null;

            var blockProps = useBlockProps.save({ className: 'atx-newsletter-block', style: wrapperStyle });

            var hasDecorativeImage = attrs.decorativeImage && attrs.decorativeImage.url;

            if (isSideLayout && hasDecorativeImage) {
                var imageArea = el(
                    'div',
                    {
                        key: 'image-area',
                        style: { flex: '0 0 45%', overflow: 'hidden' },
                    },
                    el('img', {
                        src: attrs.decorativeImage.url,
                        alt: attrs.decorativeImage.alt || '',
                        style: decorativeImageStyle,
                    })
                );

                var contentChildren = [headingEl, descriptionEl, formEl];
                if (privacyEl) contentChildren.push(privacyEl);

                var contentArea = el(
                    'div',
                    {
                        key: 'content-area',
                        style: { flex: '1', paddingLeft: attrs.imagePosition === 'left' ? '20px' : undefined, paddingRight: attrs.imagePosition === 'right' ? '20px' : undefined },
                    },
                    contentChildren
                );

                var flexRowStyle = {
                    display: 'flex',
                    flexDirection: attrs.imagePosition === 'right' ? 'row-reverse' : 'row',
                    alignItems: 'stretch',
                };

                return el(
                    'div',
                    blockProps,
                    el('div', { style: flexRowStyle }, imageArea, contentArea)
                );
            } else {
                var content = [];

                if (hasDecorativeImage) {
                    content.push(
                        el('img', {
                            key: 'decorative-img',
                            src: attrs.decorativeImage.url,
                            alt: attrs.decorativeImage.alt || '',
                            style: decorativeImageStyle,
                        })
                    );
                }

                content.push(headingEl);
                content.push(descriptionEl);
                content.push(formEl);
                if (privacyEl) content.push(privacyEl);

                return el(
                    'div',
                    blockProps,
                    content
                );
            }
        },
    });
})();
