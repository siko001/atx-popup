(function () {
    const { registerBlockType } = wp.blocks;
    const el = wp.element.createElement;
    const { Fragment } = wp.element;
    const {
        InspectorControls,
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
        Placeholder,
    } = wp.components;

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

    registerBlockType('atx-popup/media-slider', {
        title: 'ATX Media Slider',
        description:
            'Versatile media block with slider/carousel for images and videos. Use standalone or inside other blocks.',
        icon: 'slides',
        category: 'atx-popup',
        attributes: {
            slides: {
                type: 'array',
                default: [],
            },
            currentSlide: {
                type: 'number',
                default: 0,
            },
            autoPlay: {
                type: 'boolean',
                default: false,
            },
            autoPlayInterval: {
                type: 'number',
                default: 5000,
            },
            transition: {
                type: 'string',
                default: 'slide',
            },
            showArrows: {
                type: 'boolean',
                default: true,
            },
            showDots: {
                type: 'boolean',
                default: true,
            },
            overlayColor: {
                type: 'string',
                default: 'rgba(0,0,0,0)',
            },
            overlayOpacity: {
                type: 'number',
                default: 0,
            },
            minHeight: {
                type: 'number',
                default: 250,
            },
            borderRadius: {
                type: 'number',
                default: 0,
            },
            objectFit: {
                type: 'string',
                default: 'cover',
            },
            maxHeight: {
                type: 'number',
                default: 0,
            },
            maxWidth: {
                type: 'number',
                default: 0,
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
            var slides = attrs.slides;
            var currentSlide = attrs.currentSlide;

            // Clamp currentSlide to valid range
            var safeIndex =
                slides.length > 0
                    ? Math.min(currentSlide, slides.length - 1)
                    : 0;
            if (safeIndex !== currentSlide) {
                props.setAttributes({ currentSlide: safeIndex });
            }

            function onSelectMedia(media) {
                if (!media || !media.length) return;
                var newSlides = slides.slice();
                media.forEach(function (item) {
                    var mediaType = 'image';
                    if (
                        item.type === 'video' ||
                        (item.mime && item.mime.indexOf('video') === 0)
                    ) {
                        mediaType = 'video';
                    }
                    newSlides.push({
                        id: item.id,
                        url: item.url,
                        type: mediaType,
                        alt: item.alt || '',
                        caption: item.caption || '',
                        focalPoint: 'center center',
                    });
                });
                props.setAttributes({
                    slides: newSlides,
                    currentSlide: newSlides.length - 1,
                });
            }

            function removeSlide(index) {
                var newSlides = slides.filter(function (_, i) {
                    return i !== index;
                });
                var newIndex = safeIndex;
                if (newIndex >= newSlides.length) {
                    newIndex = Math.max(0, newSlides.length - 1);
                }
                props.setAttributes({
                    slides: newSlides,
                    currentSlide: newIndex,
                });
            }

            function goToSlide(index) {
                if (index < 0) index = slides.length - 1;
                if (index >= slides.length) index = 0;
                props.setAttributes({ currentSlide: index });
            }

            function updateSlideCaption(index, value) {
                var newSlides = slides.slice();
                newSlides[index] = Object.assign({}, newSlides[index], {
                    caption: value,
                });
                props.setAttributes({ slides: newSlides });
            }

            function updateSlideFocalPoint(index, value) {
                var newSlides = slides.slice();
                newSlides[index] = Object.assign({}, newSlides[index], {
                    focalPoint: value,
                });
                props.setAttributes({ slides: newSlides });
            }

            // Compute overlay style
            var overlayStyle = {
                backgroundColor: attrs.overlayColor,
                opacity: attrs.overlayOpacity / 100,
            };

            // Build the add-media button
            var addMediaButton = el(
                MediaUploadCheck,
                null,
                el(MediaUpload, {
                    onSelect: onSelectMedia,
                    allowedTypes: ['image', 'video'],
                    multiple: true,
                    render: function (obj) {
                        return el(
                            Button,
                            {
                                onClick: obj.open,
                                variant: 'primary',
                                icon: 'plus-alt',
                            },
                            'Add Media'
                        );
                    },
                })
            );

            // Inspector: Slides panel
            var slidesPanel = el(
                PanelBody,
                { title: 'Slides', initialOpen: true },
                slides.length === 0
                    ? el('p', null, 'No slides added yet.')
                    : slides.map(function (slide, i) {
                          return el(
                              'div',
                              {
                                  key: 'slide-item-' + i,
                                  onClick: function () { goToSlide(i); },
                                  style: {
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      marginBottom: '8px',
                                      padding: '6px',
                                      background:
                                          i === safeIndex
                                              ? '#e7f0fd'
                                              : '#f0f0f0',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                  },
                              },
                              slide.type === 'image'
                                  ? el('img', {
                                        src: slide.url,
                                        alt: slide.alt,
                                        style: {
                                            width: '40px',
                                            height: '40px',
                                            objectFit: 'cover',
                                            borderRadius: '3px',
                                            flexShrink: 0,
                                        },
                                    })
                                  : el(
                                        'span',
                                        {
                                            style: {
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#333',
                                                color: '#fff',
                                                borderRadius: '3px',
                                                fontSize: '16px',
                                                flexShrink: 0,
                                            },
                                        },
                                        '\u25B6'
                                    ),
                              el(
                                  'span',
                                  {
                                      style: {
                                          flex: 1,
                                          fontSize: '12px',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                      },
                                  },
                                  slide.type.charAt(0).toUpperCase() +
                                      slide.type.slice(1) +
                                      ' ' +
                                      (i + 1)
                              ),
                              el(
                                  Button,
                                  {
                                      icon: 'no-alt',
                                      isSmall: true,
                                      isDestructive: true,
                                      label: 'Remove slide',
                                      onClick: function (e) {
                                          e.stopPropagation();
                                          removeSlide(i);
                                      },
                                  }
                              )
                          );
                      }),
                el('div', { style: { marginTop: '12px' } }, addMediaButton),
                slides.length > 0 &&
                    el(
                        'div',
                        { style: { marginTop: '12px' } },
                        el(TextControl, {
                            label: 'Slide ' + (safeIndex + 1) + ' Caption',
                            value:
                                slides[safeIndex] &&
                                slides[safeIndex].caption
                                    ? slides[safeIndex].caption
                                    : '',
                            onChange: function (val) {
                                updateSlideCaption(safeIndex, val);
                            },
                        }),
                        (function () {
                            const currentFocal = (slides[safeIndex] && slides[safeIndex].focalPoint) || 'center center';
                            const isCustom = currentFocal.indexOf('%') !== -1;
                            const selectValue = isCustom ? 'custom' : currentFocal;
                            const slideUrl = slides[safeIndex] ? slides[safeIndex].url : '';

                            return el(Fragment, null,
                                el(SelectControl, {
                                    label: 'Slide ' + (safeIndex + 1) + ' Image Position',
                                    help: 'Controls which part of the image stays visible when cropped.',
                                    value: selectValue,
                                    options: [
                                        { label: 'Center', value: 'center center' },
                                        { label: 'Top', value: 'top center' },
                                        { label: 'Bottom', value: 'bottom center' },
                                        { label: 'Left', value: 'center left' },
                                        { label: 'Right', value: 'center right' },
                                        { label: 'Top Left', value: 'top left' },
                                        { label: 'Top Right', value: 'top right' },
                                        { label: 'Bottom Left', value: 'bottom left' },
                                        { label: 'Bottom Right', value: 'bottom right' },
                                        { label: 'Custom (drag to position)', value: 'custom' },
                                    ],
                                    onChange: function (val) {
                                        if (val === 'custom') {
                                            updateSlideFocalPoint(safeIndex, '50% 50%');
                                        } else {
                                            updateSlideFocalPoint(safeIndex, val);
                                        }
                                    },
                                }),
                                // Custom focal point picker
                                isCustom && slideUrl && el('div', {
                                    className: 'atx-focal-picker',
                                },
                                    el('div', {
                                        className: 'atx-focal-picker__image-wrap',
                                        onMouseDown: function (e) {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            function updatePos(ev) {
                                                const x = Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100));
                                                const y = Math.min(100, Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100));
                                                updateSlideFocalPoint(safeIndex, Math.round(x) + '% ' + Math.round(y) + '%');
                                            }
                                            updatePos(e);
                                            function onMove(ev) {
                                                ev.preventDefault();
                                                updatePos(ev);
                                            }
                                            function onUp() {
                                                document.removeEventListener('mousemove', onMove);
                                                document.removeEventListener('mouseup', onUp);
                                            }
                                            document.addEventListener('mousemove', onMove);
                                            document.addEventListener('mouseup', onUp);
                                        },
                                    },
                                        el('img', {
                                            src: slideUrl,
                                            className: 'atx-focal-picker__image',
                                            draggable: false,
                                        }),
                                        el('div', {
                                            className: 'atx-focal-picker__dot',
                                            style: {
                                                left: currentFocal.split(' ')[0],
                                                top: currentFocal.split(' ')[1],
                                            },
                                        })
                                    ),
                                    el('div', {
                                        className: 'atx-focal-picker__coords',
                                    }, 'x: ' + currentFocal.split(' ')[0] + '  y: ' + currentFocal.split(' ')[1])
                                )
                            );
                        })()
                    )
            );

            // Inspector: Slider Settings
            var sliderSettingsPanel = el(
                PanelBody,
                { title: 'Slider Settings', initialOpen: false },
                el(ToggleControl, {
                    label: 'Auto-Play',
                    checked: attrs.autoPlay,
                    onChange: function (val) {
                        props.setAttributes({ autoPlay: val });
                    },
                }),
                attrs.autoPlay &&
                    el(RangeControl, {
                        label: 'Auto-Play Interval (ms)',
                        value: attrs.autoPlayInterval,
                        onChange: function (val) {
                            props.setAttributes({ autoPlayInterval: val });
                        },
                        min: 1000,
                        max: 15000,
                        step: 500,
                    }),
                el(SelectControl, {
                    label: 'Transition Effect',
                    value: attrs.transition,
                    options: [
                        { label: 'Slide', value: 'slide' },
                        { label: 'Fade', value: 'fade' },
                    ],
                    onChange: function (val) {
                        props.setAttributes({ transition: val });
                    },
                }),
                el(ToggleControl, {
                    label: 'Show Arrows',
                    checked: attrs.showArrows,
                    onChange: function (val) {
                        props.setAttributes({ showArrows: val });
                    },
                }),
                el(ToggleControl, {
                    label: 'Show Dots',
                    checked: attrs.showDots,
                    onChange: function (val) {
                        props.setAttributes({ showDots: val });
                    },
                })
            );

            // Inspector: Navigation Style
            var navStylePanel = el(
                PanelBody,
                { title: 'Navigation Style', initialOpen: false },
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
                        props.setAttributes({ arrowStyle: val });
                    },
                }),
                attrs.arrowStyle !== 'none' && el(SelectControl, {
                    label: 'Arrow Icon',
                    value: attrs.arrowIcon,
                    options: [
                        { label: 'Chevron', value: 'chevron' },
                        { label: 'Arrow', value: 'arrow' },
                        { label: 'Caret', value: 'caret' },
                        { label: 'Angle', value: 'angle' },
                    ],
                    onChange: function (val) {
                        props.setAttributes({ arrowIcon: val });
                    },
                }),
                attrs.arrowStyle !== 'none' && el(RangeControl, {
                    label: 'Arrow Size (px)',
                    value: attrs.arrowSize,
                    onChange: function (val) {
                        props.setAttributes({ arrowSize: val });
                    },
                    min: 20,
                    max: 60,
                }),
                attrs.arrowStyle !== 'none' && el('p', { style: { marginBottom: '4px' } }, 'Arrow Background Color'),
                attrs.arrowStyle !== 'none' && el(ColorPalette, {
                    value: attrs.arrowBgColor,
                    onChange: function (val) {
                        props.setAttributes({ arrowBgColor: val || 'rgba(0,0,0,0.45)' });
                    },
                }),
                attrs.arrowStyle !== 'none' && el('p', { style: { marginBottom: '4px' } }, 'Arrow Color'),
                attrs.arrowStyle !== 'none' && el(ColorPalette, {
                    value: attrs.arrowColor,
                    onChange: function (val) {
                        props.setAttributes({ arrowColor: val || '#ffffff' });
                    },
                }),
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
                        props.setAttributes({ dotStyle: val });
                    },
                }),
                el(RangeControl, {
                    label: 'Dot Size (px)',
                    value: attrs.dotSize,
                    onChange: function (val) {
                        props.setAttributes({ dotSize: val });
                    },
                    min: 6,
                    max: 20,
                }),
                el('p', { style: { marginBottom: '4px' } }, 'Dot Color'),
                el(ColorPalette, {
                    value: attrs.dotColor,
                    onChange: function (val) {
                        props.setAttributes({ dotColor: val || 'rgba(255,255,255,0.5)' });
                    },
                }),
                el('p', { style: { marginBottom: '4px' } }, 'Dot Active Color'),
                el(ColorPalette, {
                    value: attrs.dotActiveColor,
                    onChange: function (val) {
                        props.setAttributes({ dotActiveColor: val || '#ffffff' });
                    },
                })
            );

            // Inspector: Overlay
            var overlayPanel = el(
                PanelBody,
                { title: 'Overlay', initialOpen: false },
                el('p', { style: { marginBottom: '4px' } }, 'Overlay Color'),
                el(ColorPalette, {
                    value: attrs.overlayColor,
                    onChange: function (val) {
                        props.setAttributes({
                            overlayColor: val || 'rgba(0,0,0,0)',
                        });
                    },
                }),
                el(RangeControl, {
                    label: 'Overlay Opacity (%)',
                    value: attrs.overlayOpacity,
                    onChange: function (val) {
                        props.setAttributes({ overlayOpacity: val });
                    },
                    min: 0,
                    max: 100,
                })
            );

            // Inspector: Size & Style
            var sizePanel = el(
                PanelBody,
                { title: 'Size & Style', initialOpen: false },
                el(RangeControl, {
                    label: 'Slider Height (px)',
                    value: attrs.minHeight,
                    onChange: function (val) {
                        props.setAttributes({ minHeight: val });
                    },
                    min: 100,
                    max: 1000,
                    step: 10,
                }),
                el(RangeControl, {
                    label: 'Max Height (px) — 0 = none',
                    value: attrs.maxHeight,
                    onChange: function (val) {
                        props.setAttributes({ maxHeight: val });
                    },
                    min: 0,
                    max: 1000,
                    step: 10,
                }),
                el(RangeControl, {
                    label: 'Max Width (px) — 0 = none',
                    value: attrs.maxWidth,
                    onChange: function (val) {
                        props.setAttributes({ maxWidth: val });
                    },
                    min: 0,
                    max: 1200,
                    step: 10,
                }),
                el(RangeControl, {
                    label: 'Horizontal Margin (px)',
                    value: attrs.marginX,
                    onChange: function (v) { props.setAttributes({ marginX: v }); },
                    min: 0, max: 80, step: 2,
                }),
                el(RangeControl, {
                    label: 'Border Radius (px)',
                    value: attrs.borderRadius,
                    onChange: function (val) {
                        props.setAttributes({ borderRadius: val });
                    },
                    min: 0,
                    max: 100,
                }),
                el(SelectControl, {
                    label: 'Object Fit',
                    value: attrs.objectFit,
                    options: [
                        { label: 'Cover', value: 'cover' },
                        { label: 'Contain', value: 'contain' },
                    ],
                    onChange: function (val) {
                        props.setAttributes({ objectFit: val });
                    },
                })
            );

            // Inspector controls
            var inspector = el(
                InspectorControls,
                null,
                slidesPanel,
                sliderSettingsPanel,
                navStylePanel,
                overlayPanel,
                sizePanel
            );

            // Main editor content
            var editorContent;
            var blockProps = useBlockProps();

            if (slides.length === 0) {
                // Empty placeholder
                editorContent = el(
                    'div',
                    blockProps,
                    el(Placeholder,
                        {
                            icon: 'slides',
                            label: 'ATX Media Slider',
                            instructions:
                                'Add images and videos to create a slider or media cover.',
                        },
                        addMediaButton
                    )
                );
            } else {
                // Current slide preview
                var slide = slides[safeIndex];
                var slidePreview;

                var slideFocal = slide.focalPoint || 'center center';

                if (slide.type === 'video') {
                    slidePreview = el('video', {
                        src: slide.url,
                        style: {
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            objectFit: 'cover',
                            objectPosition: slideFocal,
                            position: 'absolute',
                            inset: '0',
                        },
                        muted: true,
                        loop: true,
                        playsInline: true,
                    });
                } else {
                    slidePreview = el('img', {
                        src: slide.url,
                        alt: slide.alt,
                        style: {
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            objectFit: 'cover',
                            objectPosition: slideFocal,
                            position: 'absolute',
                            inset: '0',
                        },
                    });
                }

                // Overlay element
                var overlayEl = el('div', {
                    style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: attrs.overlayColor,
                        opacity: attrs.overlayOpacity / 100,
                        pointerEvents: 'none',
                        zIndex: 1,
                    },
                });

                // Navigation arrows
                var editorArrowBase = {
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: attrs.arrowSize + 'px',
                    height: attrs.arrowSize + 'px',
                    fontSize: Math.round(attrs.arrowSize * 0.6) + 'px',
                    lineHeight: attrs.arrowSize + 'px',
                    background: attrs.arrowStyle === 'minimal' ? 'transparent' : attrs.arrowBgColor,
                    color: attrs.arrowColor,
                    borderRadius: arrowStyleMap[attrs.arrowStyle] ? arrowStyleMap[attrs.arrowStyle].borderRadius : '50%',
                };

                var prevArrow =
                    slides.length > 1 && attrs.arrowStyle !== 'none'
                        ? el(
                              'button',
                              {
                                  onClick: function (e) {
                                      e.preventDefault();
                                      goToSlide(safeIndex - 1);
                                  },
                                  style: Object.assign({}, editorArrowBase, { left: '10px' }),
                                  'aria-label': 'Previous slide',
                              },
                              arrowIcons[attrs.arrowIcon].prev
                          )
                        : null;

                var nextArrow =
                    slides.length > 1 && attrs.arrowStyle !== 'none'
                        ? el(
                              'button',
                              {
                                  onClick: function (e) {
                                      e.preventDefault();
                                      goToSlide(safeIndex + 1);
                                  },
                                  style: Object.assign({}, editorArrowBase, { right: '10px' }),
                                  'aria-label': 'Next slide',
                              },
                              arrowIcons[attrs.arrowIcon].next
                          )
                        : null;

                // Slide counter
                var slideCounter = el(
                    'div',
                    {
                        style: {
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 3,
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600,
                        },
                    },
                    safeIndex + 1 + ' / ' + slides.length
                );

                // Dot indicators
                var editorDotStyles = dotStyleFn(attrs);
                var dotsEl =
                    slides.length > 1
                        ? el(
                              'div',
                              {
                                  style: {
                                      position: 'absolute',
                                      bottom: '10px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      zIndex: 3,
                                      display: 'flex',
                                      gap: '6px',
                                  },
                              },
                              slides.map(function (_, i) {
                                  return el('span', {
                                      key: 'dot-' + i,
                                      onClick: function () {
                                          goToSlide(i);
                                      },
                                      style: Object.assign({}, editorDotStyles[attrs.dotStyle], {
                                          background: i === safeIndex ? attrs.dotActiveColor : attrs.dotColor,
                                          cursor: 'pointer',
                                          transition: 'background 0.2s',
                                          display: 'block',
                                      }),
                                  });
                              })
                          )
                        : null;

                // Toolbar add-media button
                var addMoreButton = el(
                    'div',
                    {
                        style: {
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            zIndex: 3,
                        },
                    },
                    el(
                        MediaUploadCheck,
                        null,
                        el(MediaUpload, {
                            onSelect: onSelectMedia,
                            allowedTypes: ['image', 'video'],
                            multiple: true,
                            render: function (obj) {
                                return el(
                                    Button,
                                    {
                                        onClick: obj.open,
                                        icon: 'plus-alt',
                                        isSmall: true,
                                        style: {
                                            background: 'rgba(0,0,0,0.6)',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            minWidth: '32px',
                                            padding: 0,
                                        },
                                        label: 'Add media',
                                    }
                                );
                            },
                        })
                    )
                );

                // Caption display
                var captionEl =
                    slide.caption && slide.caption.length > 0
                        ? el(
                              'div',
                              {
                                  style: {
                                      position: 'absolute',
                                      bottom: slides.length > 1 ? '36px' : '10px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      zIndex: 3,
                                      background: 'rgba(0,0,0,0.6)',
                                      color: '#fff',
                                      padding: '4px 12px',
                                      borderRadius: '4px',
                                      fontSize: '13px',
                                      maxWidth: '80%',
                                      textAlign: 'center',
                                  },
                              },
                              slide.caption
                          )
                        : null;

                var editorWrapperStyle = {
                    position: 'relative',
                    height: attrs.minHeight + 'px',
                    borderRadius: attrs.borderRadius + 'px',
                    overflow: 'hidden',
                    background: '#222',
                };
                if (attrs.maxHeight > 0) editorWrapperStyle.maxHeight = attrs.maxHeight + 'px';
                if (attrs.maxWidth > 0) {
                    editorWrapperStyle.maxWidth = attrs.maxWidth + 'px';
                    editorWrapperStyle.marginLeft = 'auto';
                    editorWrapperStyle.marginRight = 'auto';
                }
                if (attrs.marginX > 0) { editorWrapperStyle.marginLeft = attrs.marginX + 'px'; editorWrapperStyle.marginRight = attrs.marginX + 'px'; }

                var editorWrapperProps = Object.assign({}, blockProps, { style: Object.assign({}, blockProps.style || {}, editorWrapperStyle) });
                editorContent = el(
                    'div',
                    editorWrapperProps,
                    slidePreview,
                    overlayEl,
                    prevArrow,
                    nextArrow,
                    slideCounter,
                    dotsEl,
                    addMoreButton,
                    captionEl
                );
            }

            return el(Fragment, null, inspector, editorContent);
        },

        save: function (props) {
            var attrs = props.attributes;
            var slides = attrs.slides;

            if (!slides || slides.length === 0) {
                return null;
            }

            var wrapperStyle = {
                position: 'relative',
                height: attrs.minHeight + 'px',
                borderRadius: attrs.borderRadius + 'px',
                overflow: 'hidden',
            };
            if (attrs.maxHeight > 0) wrapperStyle.maxHeight = attrs.maxHeight + 'px';
            if (attrs.maxWidth > 0) {
                wrapperStyle.maxWidth = attrs.maxWidth + 'px';
                wrapperStyle.marginLeft = 'auto';
                wrapperStyle.marginRight = 'auto';
            }
            if (attrs.marginX > 0) { wrapperStyle.marginLeft = attrs.marginX + 'px'; wrapperStyle.marginRight = attrs.marginX + 'px'; }

            var blockProps = useBlockProps.save({
                className: 'atx-media-slider-block',
                style: wrapperStyle,
                role: 'region',
                'aria-roledescription': 'carousel',
                'aria-label': 'Media slider',
                'data-autoplay': attrs.autoPlay ? 'true' : 'false',
                'data-interval': attrs.autoPlayInterval,
                'data-transition': attrs.transition,
                'data-arrows': attrs.showArrows ? 'true' : 'false',
                'data-dots': attrs.showDots ? 'true' : 'false',
            });

            // Overlay
            var overlayEl = el('div', {
                className: 'atx-slider-overlay',
                'aria-hidden': 'true',
                style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: attrs.overlayColor,
                    opacity: attrs.overlayOpacity / 100,
                    pointerEvents: 'none',
                    zIndex: 1,
                },
            });

            // Slides
            var slideElements = slides.map(function (slide, i) {
                var focal = slide.focalPoint || 'center center';
                var mediaEl;
                if (slide.type === 'video') {
                    mediaEl = el('video', {
                        src: slide.url,
                        playsInline: true,
                        loop: true,
                        muted: true,
                        preload: i === 0 ? 'metadata' : 'none',
                        style: { objectPosition: focal },
                    });
                } else {
                    mediaEl = el('img', {
                        src: slide.url,
                        alt: slide.alt || '',
                        loading: i === 0 ? 'eager' : 'lazy',
                        decoding: 'async',
                        style: { objectPosition: focal },
                    });
                }

                var captionEl =
                    slide.caption && slide.caption.length > 0
                        ? el(
                              'div',
                              { className: 'atx-slider-caption' },
                              slide.caption
                          )
                        : null;

                return el(
                    'div',
                    {
                        key: 'slide-' + i,
                        className:
                            'atx-slider-slide' +
                            (i === 0 ? ' atx-slide-active' : ''),
                        'data-index': i,
                        role: 'group',
                        'aria-roledescription': 'slide',
                        'aria-label': (i + 1) + ' of ' + slides.length,
                        'aria-hidden': i === 0 ? 'false' : 'true',
                    },
                    mediaEl,
                    captionEl
                );
            });

            var trackEl = el(
                'div',
                { className: 'atx-slider-track' },
                slideElements
            );

            // Navigation arrows
            var saveArrowStyle = attrs.arrowStyle !== 'none' ? Object.assign({
                width: attrs.arrowSize + 'px',
                height: attrs.arrowSize + 'px',
                fontSize: Math.round(attrs.arrowSize * 0.6) + 'px',
                lineHeight: attrs.arrowSize + 'px',
                background: attrs.arrowBgColor,
                color: attrs.arrowColor,
            }, arrowStyleMap[attrs.arrowStyle] || {}) : {};

            var arrowPrev = attrs.showArrows && attrs.arrowStyle !== 'none'
                ? el(
                      'button',
                      {
                          className: 'atx-slider-arrow atx-slider-prev',
                          'aria-label': 'Previous slide',
                          style: saveArrowStyle,
                      },
                      arrowIcons[attrs.arrowIcon].prev
                  )
                : null;

            var arrowNext = attrs.showArrows && attrs.arrowStyle !== 'none'
                ? el(
                      'button',
                      {
                          className: 'atx-slider-arrow atx-slider-next',
                          'aria-label': 'Next slide',
                          style: saveArrowStyle,
                      },
                      arrowIcons[attrs.arrowIcon].next
                  )
                : null;

            // Dots
            var saveDotStyles = dotStyleFn(attrs);
            var dotsEl = attrs.showDots
                ? el(
                      'div',
                      { className: 'atx-slider-dots', role: 'tablist', 'aria-label': 'Slide controls' },
                      slides.map(function (_, i) {
                          return el('button', {
                              key: 'dot-' + i,
                              type: 'button',
                              className:
                                  'atx-dot' +
                                  (i === 0 ? ' atx-dot-active' : ''),
                              'data-index': i,
                              'aria-label': 'Go to slide ' + (i + 1),
                              style: Object.assign({}, saveDotStyles[attrs.dotStyle], {
                                  background: i === 0 ? attrs.dotActiveColor : attrs.dotColor,
                              }),
                          });
                      })
                  )
                : null;

            // Screen reader live region for slide announcements
            var srLiveRegion = el('div', {
                className: 'atx-slider-live-region atx-sr-only',
                'aria-live': 'polite',
                'aria-atomic': 'true',
            }, 'Slide 1 of ' + slides.length);

            return el(
                'div',
                blockProps,
                overlayEl,
                trackEl,
                arrowPrev,
                arrowNext,
                dotsEl,
                srLiveRegion
            );
        },
    });
})();
