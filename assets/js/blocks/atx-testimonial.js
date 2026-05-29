(function () {
    var registerBlockType = wp.blocks.registerBlockType;
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var ColorPalette = wp.components.ColorPalette;

    var arrowIcons = {
        chevron: { prev: '\u2039', next: '\u203A' },
        arrow:   { prev: '\u2190', next: '\u2192' },
        caret:   { prev: '\u25C0', next: '\u25B6' },
        angle:   { prev: '\u276E', next: '\u276F' },
    };

    var arrowStyleMap = {
        circle:  { borderRadius: '50%' },
        square:  { borderRadius: '4px' },
        minimal: { background: 'transparent', borderRadius: '0' },
    };

    var dotStyleFn = function (attrs) {
        return {
            circle: { borderRadius: '50%', width: attrs.dotSize + 'px', height: attrs.dotSize + 'px' },
            pill:   { borderRadius: attrs.dotSize + 'px', width: (attrs.dotSize * 2.5) + 'px', height: attrs.dotSize + 'px' },
            dash:   { borderRadius: '2px', width: (attrs.dotSize * 3) + 'px', height: '3px' },
            square: { borderRadius: '2px', width: attrs.dotSize + 'px', height: attrs.dotSize + 'px' },
        };
    };

    var DEFAULT_ITEM = {
        quote: 'This product changed everything for us. Highly recommended!',
        authorName: 'Jane Smith',
        authorRole: 'CEO, Company',
        avatar: {},
        rating: 5,
    };

    /**
     * Render star rating as an array of span elements.
     */
    function renderStars(rating, accentColor, isEditor) {
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            var iconClass = i <= rating ? 'dashicons dashicons-star-filled' : 'dashicons dashicons-star-empty';
            stars.push(
                el('span', {
                    key: isEditor ? 'star-' + i : null,
                    className: iconClass,
                    'aria-hidden': 'true',
                    style: {
                        color: i <= rating ? accentColor : '#cccccc',
                        fontSize: '18px',
                        width: '18px',
                        height: '18px',
                        lineHeight: '18px',
                    },
                })
            );
        }
        return stars;
    }

    /**
     * Compute card styles from global attrs and layout.
     */
    function getCardStyles(attrs) {
        var borderStyle = {};
        if (attrs.layout === 'standard' || attrs.layout === 'avatar-right') {
            borderStyle = { borderLeft: '4px solid ' + attrs.accentColor };
        } else if (attrs.layout === 'centered' || attrs.layout === 'avatar-bottom') {
            borderStyle = { borderBottom: '4px solid ' + attrs.accentColor };
        }

        var flexDir = 'column';
        if (attrs.layout === 'standard') flexDir = 'row';
        else if (attrs.layout === 'avatar-right') flexDir = 'row-reverse';

        var alignCenter = (attrs.layout === 'centered' || attrs.layout === 'avatar-bottom');

        return {
            borderStyle: borderStyle,
            flexDir: flexDir,
            alignCenter: alignCenter,
            cardStyle: Object.assign({
                display: 'flex',
                flexDirection: flexDir,
                alignItems: alignCenter ? 'center' : 'flex-start',
                textAlign: alignCenter ? 'center' : 'left',
                gap: '20px',
                boxSizing: 'border-box',
            }, borderStyle),
            quoteIconStyle: {
                fontSize: '48px',
                lineHeight: '1',
                color: attrs.accentColor,
                opacity: '0.3',
                fontFamily: 'Georgia, serif',
                marginBottom: '8px',
                display: 'block',
            },
            quoteStyle: {
                fontSize: '16px',
                lineHeight: '1.6',
                color: attrs.textColor,
                marginBottom: '16px',
                fontStyle: 'italic',
            },
            authorNameStyle: {
                fontSize: '15px',
                fontWeight: '700',
                color: attrs.textColor,
                marginBottom: '2px',
            },
            authorRoleStyle: {
                fontSize: '13px',
                color: attrs.textColor,
                opacity: '0.7',
            },
            starsWrapperStyle: {
                display: 'flex',
                gap: '2px',
                marginBottom: '12px',
                justifyContent: alignCenter ? 'center' : 'flex-start',
            },
            avatarStyle: {
                width: attrs.avatarSize + 'px',
                height: attrs.avatarSize + 'px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: '0',
            },
        };
    }

    /**
     * Build the wrapper (outer block) style with background, padding, etc.
     */
    function getWrapperStyle(attrs) {
        var style = {
            backgroundColor: attrs.backgroundColor,
            borderRadius: attrs.borderRadius + 'px',
            padding: attrs.padding + 'px',
            color: attrs.textColor,
            boxSizing: 'border-box',
            position: 'relative',
        };
        if (attrs.backgroundImage && attrs.backgroundImage.url) {
            style.backgroundImage = 'url(' + attrs.backgroundImage.url + ')';
            style.backgroundSize = 'cover';
            style.backgroundPosition = 'center';
            style.backgroundAttachment = attrs.backgroundAttachment || 'scroll';
        }
        return style;
    }

    /**
     * Render a single testimonial card for the save function.
     * Returns an array of children to place inside a flex container.
     */
    function renderSaveCard(item, attrs, styles) {
        var contentChildren = [];

        if (attrs.showQuoteIcon) {
            contentChildren.push(
                el('span', {
                    style: styles.quoteIconStyle,
                    'aria-hidden': 'true',
                    className: 'atx-testimonial-quote-icon',
                }, '\u201C')
            );
        }

        if (attrs.showRating && item.rating > 0) {
            contentChildren.push(
                el('div', {
                    className: 'atx-testimonial-stars',
                    style: styles.starsWrapperStyle,
                    role: 'img',
                    'aria-label': 'Rated ' + item.rating + ' out of 5 stars',
                }, renderStars(item.rating, attrs.accentColor, false))
            );
        }

        contentChildren.push(
            el(RichText.Content, {
                tagName: 'blockquote',
                style: styles.quoteStyle,
                value: item.quote,
                className: 'atx-testimonial-quote',
            })
        );

        contentChildren.push(
            el(RichText.Content, {
                tagName: 'div',
                style: styles.authorNameStyle,
                value: item.authorName,
                className: 'atx-testimonial-author-name',
            })
        );

        contentChildren.push(
            el(RichText.Content, {
                tagName: 'div',
                style: styles.authorRoleStyle,
                value: item.authorRole,
                className: 'atx-testimonial-author-role',
            })
        );

        var contentEl = el('div', { style: { flex: '1', minWidth: '0' } }, contentChildren);

        var hasAvatar = item.avatar && item.avatar.url;
        var avatarImg = hasAvatar
            ? el('img', {
                src: item.avatar.url,
                alt: item.avatar.alt || '',
                style: styles.avatarStyle,
                className: 'atx-testimonial-avatar',
            })
            : null;

        var blockChildren = [];

        if (attrs.layout === 'avatar-bottom') {
            blockChildren.push(contentEl);
            if (avatarImg) {
                blockChildren.push(el('div', { style: { marginTop: '4px' } }, avatarImg));
            }
        } else if (attrs.layout === 'centered') {
            if (avatarImg) {
                blockChildren.push(el('div', { style: { marginBottom: '4px' } }, avatarImg));
            }
            blockChildren.push(contentEl);
        } else if ((attrs.layout === 'standard' || attrs.layout === 'avatar-right') && avatarImg) {
            blockChildren.push(el('div', { style: { flexShrink: '0', alignSelf: 'flex-start' } }, avatarImg));
            blockChildren.push(contentEl);
        } else {
            blockChildren.push(contentEl);
        }

        return blockChildren;
    }

    registerBlockType('atx-popup/testimonial', {
        title: 'ATX Testimonial',
        description: 'Testimonial or review card with quote, author, and avatar. Supports multiple testimonials with a slider.',
        icon: 'format-quote',
        category: 'atx-popup',
        attributes: {
            items: {
                type: 'array',
                default: [
                    {
                        quote: 'This product changed everything for us. Highly recommended!',
                        authorName: 'Jane Smith',
                        authorRole: 'CEO, Company',
                        avatar: {},
                        rating: 5,
                    },
                ],
            },
            currentIndex: {
                type: 'number',
                default: 0,
            },
            enableSlider: {
                type: 'boolean',
                default: true,
            },
            autoPlay: {
                type: 'boolean',
                default: false,
            },
            autoPlayInterval: {
                type: 'number',
                default: 5000,
            },
            showArrows: {
                type: 'boolean',
                default: true,
            },
            showDots: {
                type: 'boolean',
                default: true,
            },
            layout: {
                type: 'string',
                default: 'standard',
            },
            showQuoteIcon: {
                type: 'boolean',
                default: true,
            },
            showRating: {
                type: 'boolean',
                default: true,
            },
            backgroundColor: {
                type: 'string',
                default: '#ffffff',
            },
            accentColor: {
                type: 'string',
                default: '#e94560',
            },
            textColor: {
                type: 'string',
                default: '#333333',
            },
            avatarSize: {
                type: 'number',
                default: 64,
            },
            backgroundImage: {
                type: 'object',
                default: {},
            },
            backgroundAttachment: {
                type: 'string',
                default: 'scroll',
            },
            borderRadius: {
                type: 'number',
                default: 8,
            },
            padding: {
                type: 'number',
                default: 30,
            },
            marginX: {
                type: 'number',
                default: 0,
            },
            arrowStyle: {
                type: 'string',
                default: 'circle',
            },
            arrowSize: {
                type: 'number',
                default: 36,
            },
            arrowBgColor: {
                type: 'string',
                default: 'rgba(0,0,0,0.45)',
            },
            arrowColor: {
                type: 'string',
                default: '#ffffff',
            },
            arrowIcon: {
                type: 'string',
                default: 'chevron',
            },
            dotStyle: {
                type: 'string',
                default: 'circle',
            },
            dotSize: {
                type: 'number',
                default: 10,
            },
            dotColor: {
                type: 'string',
                default: 'rgba(255,255,255,0.5)',
            },
            dotActiveColor: {
                type: 'string',
                default: '#ffffff',
            },
        },

        edit: function (props) {
            var attrs = props.attributes;
            var setAttributes = props.setAttributes;
            var items = attrs.items || [];
            var currentIndex = Math.min(attrs.currentIndex || 0, Math.max(items.length - 1, 0));
            var currentItem = items[currentIndex] || DEFAULT_ITEM;

            // --- Helper functions ---
            function updateItem(index, key, value) {
                var newItems = items.map(function (item, i) {
                    if (i === index) {
                        var updated = Object.assign({}, item);
                        updated[key] = value;
                        return updated;
                    }
                    return item;
                });
                setAttributes({ items: newItems });
            }

            function removeItem(index) {
                if (items.length <= 1) return;
                var newItems = items.filter(function (_, i) { return i !== index; });
                var newIndex = currentIndex;
                if (currentIndex >= newItems.length) {
                    newIndex = newItems.length - 1;
                }
                setAttributes({ items: newItems, currentIndex: newIndex });
            }

            function addItem() {
                var newItems = items.concat([{
                    quote: 'Enter testimonial quote here...',
                    authorName: 'Author Name',
                    authorRole: 'Role, Company',
                    avatar: {},
                    rating: 5,
                }]);
                setAttributes({ items: newItems, currentIndex: newItems.length - 1 });
            }

            function goToItem(index) {
                if (index >= 0 && index < items.length) {
                    setAttributes({ currentIndex: index });
                }
            }

            // --- Styles ---
            var styles = getCardStyles(attrs);
            var wrapperStyle = getWrapperStyle(attrs);

            var avatarPlaceholderStyle = {
                width: attrs.avatarSize + 'px',
                height: attrs.avatarSize + 'px',
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: '0',
                color: '#999999',
                fontSize: '24px',
            };

            // --- Build avatar element for current item ---
            var avatarEl = null;
            if (attrs.layout !== 'minimal') {
                if (currentItem.avatar && currentItem.avatar.url) {
                    avatarEl = el('img', {
                        src: currentItem.avatar.url,
                        alt: currentItem.avatar.alt || '',
                        style: styles.avatarStyle,
                    });
                } else {
                    avatarEl = el('div', { style: avatarPlaceholderStyle },
                        el('span', { className: 'dashicons dashicons-admin-users' })
                    );
                }
            }

            // --- Build content area for current item ---
            var contentChildren = [];

            if (attrs.showQuoteIcon) {
                contentChildren.push(
                    el('span', {
                        key: 'quote-icon',
                        style: styles.quoteIconStyle,
                        'aria-hidden': 'true',
                    }, '\u201C')
                );
            }

            if (attrs.showRating) {
                contentChildren.push(
                    el('div', { key: 'stars', style: styles.starsWrapperStyle },
                        renderStars(currentItem.rating, attrs.accentColor, true)
                    )
                );
            }

            contentChildren.push(
                el(RichText, {
                    key: 'quote-' + currentIndex,
                    tagName: 'p',
                    style: styles.quoteStyle,
                    value: currentItem.quote,
                    onChange: function (value) {
                        updateItem(currentIndex, 'quote', value);
                    },
                    placeholder: 'Write the testimonial quote...',
                })
            );

            contentChildren.push(
                el(RichText, {
                    key: 'name-' + currentIndex,
                    tagName: 'div',
                    style: styles.authorNameStyle,
                    value: currentItem.authorName,
                    onChange: function (value) {
                        updateItem(currentIndex, 'authorName', value);
                    },
                    placeholder: 'Author name',
                })
            );

            contentChildren.push(
                el(RichText, {
                    key: 'role-' + currentIndex,
                    tagName: 'div',
                    style: styles.authorRoleStyle,
                    value: currentItem.authorRole,
                    onChange: function (value) {
                        updateItem(currentIndex, 'authorRole', value);
                    },
                    placeholder: 'Author role / title',
                })
            );

            var contentEl = el('div', { style: { flex: '1', minWidth: '0' } }, contentChildren);

            // --- Build card children based on layout ---
            var cardChildren = [];

            if (attrs.layout === 'avatar-bottom') {
                cardChildren.push(contentEl);
                if (avatarEl) {
                    cardChildren.push(el('div', { key: 'avatar', style: { marginTop: '4px' } }, avatarEl));
                }
            } else if (attrs.layout === 'centered') {
                if (avatarEl) {
                    cardChildren.push(el('div', { key: 'avatar', style: { marginBottom: '4px' } }, avatarEl));
                }
                cardChildren.push(contentEl);
            } else if ((attrs.layout === 'standard' || attrs.layout === 'avatar-right') && avatarEl) {
                cardChildren.push(el('div', { key: 'avatar', style: { flexShrink: '0', alignSelf: 'flex-start' } }, avatarEl));
                cardChildren.push(contentEl);
            } else {
                cardChildren.push(contentEl);
            }

            // --- Editor navigation controls ---
            var navControls = [];

            if (items.length > 1) {
                var editorArrowBase = {
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    width: attrs.arrowSize + 'px',
                    height: attrs.arrowSize + 'px',
                    minWidth: attrs.arrowSize + 'px',
                    fontSize: Math.round(attrs.arrowSize * 0.6) + 'px',
                    lineHeight: attrs.arrowSize + 'px',
                    background: attrs.arrowStyle === 'minimal' ? 'transparent' : attrs.arrowBgColor,
                    color: attrs.arrowColor,
                    borderRadius: arrowStyleMap[attrs.arrowStyle] ? arrowStyleMap[attrs.arrowStyle].borderRadius : '50%',
                };

                // Prev arrow
                if (attrs.arrowStyle !== 'none') {
                    navControls.push(
                        el(Button, {
                            key: 'prev',
                            isSmall: true,
                            onClick: function () {
                                goToItem(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
                            },
                            style: Object.assign({}, editorArrowBase, { left: '8px' }),
                        }, arrowIcons[attrs.arrowIcon].prev)
                    );

                    // Next arrow
                    navControls.push(
                        el(Button, {
                            key: 'next',
                            isSmall: true,
                            onClick: function () {
                                goToItem(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
                            },
                            style: Object.assign({}, editorArrowBase, { right: '8px' }),
                        }, arrowIcons[attrs.arrowIcon].next)
                    );
                }

                // Counter badge
                navControls.push(
                    el('div', {
                        key: 'counter',
                        style: {
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            borderRadius: '12px',
                            padding: '2px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            zIndex: 10,
                            fontStyle: 'normal',
                        },
                    }, (currentIndex + 1) + ' / ' + items.length)
                );

                // Dots
                var editorDotStyles = dotStyleFn(attrs);
                var dots = items.map(function (_, i) {
                    return el('span', {
                        key: 'dot-' + i,
                        onClick: function () { goToItem(i); },
                        style: Object.assign({}, editorDotStyles[attrs.dotStyle], {
                            background: i === currentIndex ? attrs.dotActiveColor : attrs.dotColor,
                            display: 'inline-block',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }),
                    });
                });

                navControls.push(
                    el('div', {
                        key: 'dots',
                        style: {
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '6px',
                            marginTop: '12px',
                        },
                    }, dots)
                );
            }

            // --- Inspector Controls ---

            // Testimonials list panel
            var testimonialListItems = items.map(function (item, i) {
                return el('div', {
                    key: 'item-' + i,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        marginBottom: '4px',
                        backgroundColor: i === currentIndex ? '#f0f0f0' : 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: i === currentIndex ? '1px solid ' + attrs.accentColor : '1px solid #ddd',
                    },
                    onClick: function () { goToItem(i); },
                },
                    el('span', {
                        style: {
                            fontSize: '13px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: '1',
                            marginRight: '8px',
                        },
                    }, item.authorName || 'Testimonial ' + (i + 1)),
                    items.length > 1
                        ? el(Button, {
                            isSmall: true,
                            isDestructive: true,
                            onClick: function (e) {
                                e.stopPropagation();
                                removeItem(i);
                            },
                            style: { minWidth: 'auto', padding: '0 4px' },
                        }, '\u00D7')
                        : null
                );
            });

            // Per-testimonial fields in sidebar
            var perItemFields = [];

            // Avatar upload for current item
            if (attrs.layout !== 'minimal') {
                perItemFields.push(
                    el('p', { key: 'avatar-label', style: { marginBottom: '8px', fontWeight: '600', marginTop: '12px' } }, 'Avatar'),
                    el(MediaUploadCheck, { key: 'avatar-upload-check' },
                        el(MediaUpload, {
                            onSelect: function (media) {
                                updateItem(currentIndex, 'avatar', {
                                    id: media.id,
                                    url: media.url,
                                    alt: media.alt || '',
                                });
                            },
                            allowedTypes: ['image'],
                            value: currentItem.avatar && currentItem.avatar.id ? currentItem.avatar.id : undefined,
                            render: function (obj) {
                                return el(Fragment, null,
                                    currentItem.avatar && currentItem.avatar.url
                                        ? el('div', { style: { marginBottom: '10px' } },
                                            el('img', {
                                                src: currentItem.avatar.url,
                                                alt: currentItem.avatar.alt || '',
                                                style: { maxWidth: '80px', height: 'auto', borderRadius: '50%' },
                                            }),
                                            el(Button, {
                                                isDestructive: true,
                                                isSmall: true,
                                                onClick: function () {
                                                    updateItem(currentIndex, 'avatar', {});
                                                },
                                                style: { marginTop: '8px', display: 'block' },
                                            }, 'Remove Avatar')
                                        )
                                        : null,
                                    el(Button, {
                                        isSecondary: true,
                                        onClick: obj.open,
                                    }, currentItem.avatar && currentItem.avatar.url ? 'Replace Avatar' : 'Select Avatar')
                                );
                            },
                        })
                    )
                );
            }

            // Rating for current item
            if (attrs.showRating) {
                perItemFields.push(
                    el(RangeControl, {
                        key: 'item-rating',
                        label: 'Rating (stars)',
                        value: currentItem.rating,
                        onChange: function (value) {
                            updateItem(currentIndex, 'rating', value);
                        },
                        min: 0,
                        max: 5,
                        step: 1,
                    })
                );
            }

            var inspectorControls = el(InspectorControls, null,
                // Testimonials panel
                el(PanelBody, { title: 'Testimonials', initialOpen: true },
                    testimonialListItems,
                    el(Button, {
                        isPrimary: true,
                        isSmall: true,
                        onClick: addItem,
                        style: { marginTop: '8px', width: '100%', justifyContent: 'center' },
                    }, 'Add Testimonial'),
                    items.length > 0
                        ? el('div', { style: { marginTop: '16px', borderTop: '1px solid #ddd', paddingTop: '12px' } },
                            el('p', { style: { fontWeight: '600', fontSize: '13px', marginBottom: '8px' } },
                                'Editing: ' + (currentItem.authorName || 'Testimonial ' + (currentIndex + 1))
                            ),
                            perItemFields
                        )
                        : null
                ),
                // Slider Settings panel
                el(PanelBody, { title: 'Slider Settings', initialOpen: false },
                    el(ToggleControl, {
                        label: 'Enable Slider',
                        help: 'When off, all testimonials show stacked vertically.',
                        checked: attrs.enableSlider,
                        onChange: function (value) {
                            setAttributes({ enableSlider: value });
                        },
                    }),
                    attrs.enableSlider
                        ? el(Fragment, null,
                            el(ToggleControl, {
                                label: 'Auto-Play',
                                checked: attrs.autoPlay,
                                onChange: function (value) {
                                    setAttributes({ autoPlay: value });
                                },
                            }),
                            attrs.autoPlay
                                ? el(RangeControl, {
                                    label: 'Auto-Play Interval (ms)',
                                    value: attrs.autoPlayInterval,
                                    onChange: function (value) {
                                        setAttributes({ autoPlayInterval: value });
                                    },
                                    min: 1000,
                                    max: 15000,
                                    step: 500,
                                })
                                : null,
                            el(ToggleControl, {
                                label: 'Show Arrows',
                                checked: attrs.showArrows,
                                onChange: function (value) {
                                    setAttributes({ showArrows: value });
                                },
                            }),
                            el(ToggleControl, {
                                label: 'Show Dots',
                                checked: attrs.showDots,
                                onChange: function (value) {
                                    setAttributes({ showDots: value });
                                },
                            })
                        )
                        : null
                ),
                // Navigation Style panel
                el(PanelBody, { title: 'Navigation Style', initialOpen: false },
                    el(SelectControl, {
                        label: 'Arrow Style',
                        value: attrs.arrowStyle,
                        options: [
                            { label: 'Circle', value: 'circle' },
                            { label: 'Square', value: 'square' },
                            { label: 'Minimal', value: 'minimal' },
                            { label: 'None', value: 'none' },
                        ],
                        onChange: function (val) {
                            setAttributes({ arrowStyle: val });
                        },
                    }),
                    attrs.arrowStyle !== 'none' ? el(SelectControl, {
                        label: 'Arrow Icon',
                        value: attrs.arrowIcon,
                        options: [
                            { label: 'Chevron', value: 'chevron' },
                            { label: 'Arrow', value: 'arrow' },
                            { label: 'Caret', value: 'caret' },
                            { label: 'Angle', value: 'angle' },
                        ],
                        onChange: function (val) {
                            setAttributes({ arrowIcon: val });
                        },
                    }) : null,
                    attrs.arrowStyle !== 'none' ? el(RangeControl, {
                        label: 'Arrow Size (px)',
                        value: attrs.arrowSize,
                        onChange: function (val) {
                            setAttributes({ arrowSize: val });
                        },
                        min: 20,
                        max: 60,
                    }) : null,
                    attrs.arrowStyle !== 'none' ? el('p', { style: { marginBottom: '4px' } }, 'Arrow Background Color') : null,
                    attrs.arrowStyle !== 'none' ? el(ColorPalette, {
                        value: attrs.arrowBgColor,
                        onChange: function (val) {
                            setAttributes({ arrowBgColor: val || 'rgba(0,0,0,0.45)' });
                        },
                    }) : null,
                    attrs.arrowStyle !== 'none' ? el('p', { style: { marginBottom: '4px' } }, 'Arrow Color') : null,
                    attrs.arrowStyle !== 'none' ? el(ColorPalette, {
                        value: attrs.arrowColor,
                        onChange: function (val) {
                            setAttributes({ arrowColor: val || '#ffffff' });
                        },
                    }) : null,
                    el(SelectControl, {
                        label: 'Dot Style',
                        value: attrs.dotStyle,
                        options: [
                            { label: 'Circle', value: 'circle' },
                            { label: 'Pill', value: 'pill' },
                            { label: 'Dash', value: 'dash' },
                            { label: 'Square', value: 'square' },
                        ],
                        onChange: function (val) {
                            setAttributes({ dotStyle: val });
                        },
                    }),
                    el(RangeControl, {
                        label: 'Dot Size (px)',
                        value: attrs.dotSize,
                        onChange: function (val) {
                            setAttributes({ dotSize: val });
                        },
                        min: 6,
                        max: 20,
                    }),
                    el('p', { style: { marginBottom: '4px' } }, 'Dot Color'),
                    el(ColorPalette, {
                        value: attrs.dotColor,
                        onChange: function (val) {
                            setAttributes({ dotColor: val || 'rgba(255,255,255,0.5)' });
                        },
                    }),
                    el('p', { style: { marginBottom: '4px' } }, 'Dot Active Color'),
                    el(ColorPalette, {
                        value: attrs.dotActiveColor,
                        onChange: function (val) {
                            setAttributes({ dotActiveColor: val || '#ffffff' });
                        },
                    })
                ),
                // Layout panel
                el(PanelBody, { title: 'Layout', initialOpen: false },
                    el(SelectControl, {
                        label: 'Layout Style',
                        value: attrs.layout,
                        options: [
                            { label: 'Standard (avatar left)', value: 'standard' },
                            { label: 'Centered (avatar top)', value: 'centered' },
                            { label: 'Avatar Right', value: 'avatar-right' },
                            { label: 'Avatar Bottom', value: 'avatar-bottom' },
                            { label: 'Minimal (no avatar)', value: 'minimal' },
                        ],
                        onChange: function (value) {
                            setAttributes({ layout: value });
                        },
                    }),
                    el(ToggleControl, {
                        label: 'Show Quote Icon',
                        checked: attrs.showQuoteIcon,
                        onChange: function (value) {
                            setAttributes({ showQuoteIcon: value });
                        },
                    }),
                    el(ToggleControl, {
                        label: 'Show Star Rating',
                        checked: attrs.showRating,
                        onChange: function (value) {
                            setAttributes({ showRating: value });
                        },
                    }),
                    attrs.layout !== 'minimal'
                        ? el(RangeControl, {
                            label: 'Avatar Size (px)',
                            value: attrs.avatarSize,
                            onChange: function (value) {
                                setAttributes({ avatarSize: value });
                            },
                            min: 32,
                            max: 120,
                            step: 8,
                        })
                        : null
                ),
                // Style panel
                el(PanelBody, { title: 'Style', initialOpen: false },
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Background Color'),
                    el(ColorPalette, {
                        value: attrs.backgroundColor,
                        onChange: function (value) {
                            setAttributes({ backgroundColor: value || '#ffffff' });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Text Color'),
                    el(ColorPalette, {
                        value: attrs.textColor,
                        onChange: function (value) {
                            setAttributes({ textColor: value || '#333333' });
                        },
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600' } }, 'Accent / Border Color'),
                    el(ColorPalette, {
                        value: attrs.accentColor,
                        onChange: function (value) {
                            setAttributes({ accentColor: value || '#e94560' });
                        },
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
                        label: 'Padding (px)',
                        value: attrs.padding,
                        onChange: function (value) {
                            setAttributes({ padding: value });
                        },
                        min: 0,
                        max: 80,
                        step: 5,
                    }),
                    el(RangeControl, {
                        label: 'Horizontal Margin (px)',
                        value: attrs.marginX,
                        onChange: function (v) { setAttributes({ marginX: v }); },
                        min: 0, max: 80, step: 2,
                    }),
                    el('p', { style: { marginBottom: '8px', fontWeight: '600', marginTop: '16px' } }, 'Background Image'),
                    el(MediaUploadCheck, null,
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
                            value: attrs.backgroundImage && attrs.backgroundImage.id ? attrs.backgroundImage.id : undefined,
                            render: function (obj) {
                                return el(Fragment, null,
                                    attrs.backgroundImage && attrs.backgroundImage.url
                                        ? el('div', { style: { marginBottom: '10px' } },
                                            el('img', {
                                                src: attrs.backgroundImage.url,
                                                alt: attrs.backgroundImage.alt || '',
                                                style: { maxWidth: '100%', height: 'auto', borderRadius: '4px' },
                                            }),
                                            el(Button, {
                                                isDestructive: true,
                                                isSmall: true,
                                                onClick: function () {
                                                    setAttributes({ backgroundImage: {} });
                                                },
                                                style: { marginTop: '8px', display: 'block' },
                                            }, 'Remove Background Image')
                                        )
                                        : null,
                                    el(Button, {
                                        isSecondary: true,
                                        onClick: obj.open,
                                    }, attrs.backgroundImage && attrs.backgroundImage.url ? 'Replace Background Image' : 'Select Background Image')
                                );
                            },
                        })
                    ),
                    attrs.backgroundImage && attrs.backgroundImage.url
                        ? el(SelectControl, {
                            label: 'Background Attachment',
                            value: attrs.backgroundAttachment,
                            options: [
                                { label: 'Scroll', value: 'scroll' },
                                { label: 'Fixed (parallax)', value: 'fixed' },
                            ],
                            onChange: function (value) {
                                setAttributes({ backgroundAttachment: value });
                            },
                        })
                        : null
                )
            );

            if (attrs.marginX > 0) { wrapperStyle.marginLeft = attrs.marginX + 'px'; wrapperStyle.marginRight = attrs.marginX + 'px'; }

            // --- Build block preview ---
            var blockProps = useBlockProps({
                className: 'atx-testimonial-block',
                style: wrapperStyle,
            });

            // The testimonial card
            var cardEl = el('div', {
                style: styles.cardStyle,
            }, cardChildren);

            // Build the final preview with nav controls
            var previewChildren = [cardEl];
            navControls.forEach(function (ctrl) {
                previewChildren.push(ctrl);
            });

            var blockPreview = el('div', blockProps, previewChildren);

            return el(Fragment, null, inspectorControls, blockPreview);
        },

        save: function (props) {
            var attrs = props.attributes;
            var items = attrs.items || [];
            var styles = getCardStyles(attrs);
            var wrapperStyle = getWrapperStyle(attrs);
            if (attrs.marginX > 0) { wrapperStyle.marginLeft = attrs.marginX + 'px'; wrapperStyle.marginRight = attrs.marginX + 'px'; }
            var isSlider = attrs.enableSlider && items.length > 1;

            var sliderAriaProps = isSlider ? {
                role: 'region',
                'aria-roledescription': 'carousel',
                'aria-label': 'Testimonials',
            } : {};

            var blockProps = useBlockProps.save(Object.assign({
                className: 'atx-testimonial-block' + (isSlider ? ' atx-testimonial-slider' : ''),
                style: wrapperStyle,
            }, sliderAriaProps));

            if (isSlider) {
                // Data attributes for frontend JS
                blockProps['data-autoplay'] = attrs.autoPlay ? 'true' : 'false';
                blockProps['data-interval'] = String(attrs.autoPlayInterval);
                blockProps['data-arrows'] = attrs.showArrows ? 'true' : 'false';
                blockProps['data-dots'] = attrs.showDots ? 'true' : 'false';

                // Build slides
                var slides = items.map(function (item, i) {
                    var slideChildren = renderSaveCard(item, attrs, styles);
                    return el('div', {
                        key: 'slide-' + i,
                        className: 'atx-testimonial-slide' + (i === 0 ? ' atx-testi-active' : ''),
                        'data-index': String(i),
                        style: styles.cardStyle,
                        role: 'group',
                        'aria-roledescription': 'slide',
                        'aria-label': (i + 1) + ' of ' + items.length,
                        'aria-hidden': i === 0 ? 'false' : 'true',
                    }, slideChildren);
                });

                var trackEl = el('div', { className: 'atx-testimonial-track' }, slides);

                var saveArrowStyle = attrs.arrowStyle !== 'none' ? Object.assign({
                    width: attrs.arrowSize + 'px',
                    height: attrs.arrowSize + 'px',
                    fontSize: Math.round(attrs.arrowSize * 0.6) + 'px',
                    lineHeight: attrs.arrowSize + 'px',
                    background: attrs.arrowBgColor,
                    color: attrs.arrowColor,
                }, arrowStyleMap[attrs.arrowStyle] || {}) : {};

                var arrowsEl = attrs.showArrows && attrs.arrowStyle !== 'none'
                    ? el(Fragment, null,
                        el('button', {
                            className: 'atx-testi-arrow atx-testi-prev',
                            'aria-label': 'Previous testimonial',
                            style: saveArrowStyle,
                        }, arrowIcons[attrs.arrowIcon].prev),
                        el('button', {
                            className: 'atx-testi-arrow atx-testi-next',
                            'aria-label': 'Next testimonial',
                            style: saveArrowStyle,
                        }, arrowIcons[attrs.arrowIcon].next)
                    )
                    : null;

                var saveDotStyles = dotStyleFn(attrs);
                var dotsEl = attrs.showDots
                    ? el('div', { className: 'atx-testi-dots', role: 'tablist', 'aria-label': 'Testimonial controls' },
                        items.map(function (_, i) {
                            return el('button', {
                                key: 'dot-' + i,
                                type: 'button',
                                className: 'atx-testi-dot' + (i === 0 ? ' atx-testi-dot-active' : ''),
                                'data-index': String(i),
                                'aria-label': 'Go to testimonial ' + (i + 1),
                                style: Object.assign({}, saveDotStyles[attrs.dotStyle], {
                                    background: i === 0 ? attrs.dotActiveColor : attrs.dotColor,
                                }),
                            });
                        })
                    )
                    : null;

                // Screen reader live region for slide announcements
                var srLiveRegion = el('div', {
                    className: 'atx-testi-live-region atx-sr-only',
                    'aria-live': 'polite',
                    'aria-atomic': 'true',
                }, 'Testimonial 1 of ' + items.length);

                return el('div', blockProps, trackEl, arrowsEl, dotsEl, srLiveRegion);
            } else {
                // Stacked: render all testimonials vertically
                var stackedCards = items.map(function (item, i) {
                    var cardContentChildren = renderSaveCard(item, attrs, styles);
                    return el('div', {
                        key: 'card-' + i,
                        className: 'atx-testimonial-card',
                        style: Object.assign({}, styles.cardStyle, i < items.length - 1 ? { marginBottom: '20px' } : {}),
                    }, cardContentChildren);
                });

                return el('div', blockProps, stackedCards);
            }
        },
    });
})();
