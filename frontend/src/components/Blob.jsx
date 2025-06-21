// // components/AnimatedBlob.jsx
// import { motion } from 'framer-motion';
// import { useMemo } from 'react';

// const defaultColors = [
//     'hsla(256, 92%, 60%, 0.9)', // Vibrant purple-blue
//     'hsla(283, 79%, 65%, 0.85)', // Soft purple
//     'hsla(299, 90%, 74%, 0.8)', // Pinkish purple
//     'hsla(291, 78%, 62%, 0.85)', // Purple-magenta
//     'hsla(357, 95%, 73%, 0.9)', // Bright pink-red
//     'hsla(216, 82%, 62%, 0.85)', // Blue
//     'hsla(170, 91%, 78%, 0.8)', // Aqua
//     'hsla(150, 71%, 68%, 0.85)', // Teal
//     'hsla(76, 75%, 63%, 0.9)', // Lime green
// ];

// const defaultShapes = [
//     'M45.3,-48.4C61.3,-40.5,78.7,-28.7,85.7,-11.7C92.7,5.3,89.4,27.5,76.4,38.5C63.3,49.5,40.6,49.3,21.9,53.1C3.1,57,-11.6,64.8,-23.7,61.8C-35.8,58.9,-45.2,45.2,-51,31.3C-56.8,17.4,-59,3.3,-59.7,-13.6C-60.5,-30.6,-59.7,-50.4,-49.5,-59.3C-39.3,-68.1,-19.6,-66,-2.5,-63C14.6,-60.1,29.3,-56.2,45.3,-48.4Z',
//     'M48.1,-56.4C62,-45.7,72.7,-30.2,75.2,-13.6C77.7,2.9,71.9,20.6,61.3,32.1C50.7,43.7,35.3,49.2,20.3,53.7C5.3,58.3,-9.3,62.1,-25.7,60.5C-42,58.9,-60.2,52,-71.5,38.4C-82.9,24.7,-87.5,4.2,-80.5,-10.5C-73.5,-25.3,-55,-34.3,-39.6,-44.8C-24.3,-55.2,-12.1,-67.1,2.5,-70.1C17.1,-73,34.2,-67.1,48.1,-56.4Z',
//     'M50.1,-54.3C64.2,-46.7,74.2,-29.7,75.9,-12.2C77.6,5.3,71,23.4,59.1,36.5C47.2,49.7,30,58,10.9,66.9C-8.3,75.8,-19.4,85.4,-31.4,80.8C-43.4,76.2,-56.3,57.5,-63.9,37.4C-71.5,17.3,-73.8,-4.1,-67.2,-20.8C-60.6,-37.5,-45.1,-49.5,-29.1,-56.6C-13.1,-63.7,3.4,-65.9,19.3,-61.8C35.2,-57.7,50.5,-47.3,50.1,-54.3Z',
//     'M52.5,-58.2C67.5,-50,78.9,-32.9,77.7,-17C76.6,-1.1,63,13.7,51.5,26C39.9,38.3,30.5,48.1,18.2,54.7C5.8,61.3,-9.5,64.7,-21.7,60.1C-34,55.4,-43.2,42.8,-52.1,29.2C-61.1,15.6,-69.7,0.9,-71.3,-16.4C-72.8,-33.7,-67.3,-53.6,-54.2,-62.2C-41.1,-70.8,-20.6,-68.1,-0.9,-67C18.7,-66,37.5,-66.5,52.5,-58.2Z',
//     'M50.4,-58.7C68.7,-52.8,77.2,-34,78.5,-15.5C79.8,3,73.9,21.1,63.8,35.1C53.7,49.1,39.4,59,22.7,67.2C6.1,75.3,-13,81.6,-24.5,74.3C-36,67.1,-40,46.3,-49.8,28.9C-59.5,11.6,-75,-2.2,-74.9,-15C-74.7,-27.7,-58.9,-39.5,-43.8,-45.3C-28.7,-51.1,-14.3,-50.8,2.9,-54.2C20,-57.6,40.1,-64.7,54.4,-58.7Z',
// ];

// export default function AnimatedBlob({
//     size = 500,
//     rotationDuration = 30,
//     morphDuration = 15,
//     colors = defaultColors,
//     gradientSpread = '120%',
//     gradientCenter = ['50%', '50%'],
//     opacity = 1,
//     className = '',
//     enableRotation = true,
//     enableMorph = true,
//     blur = false,
// }) {
//     const gradientId = useMemo(() => `blobGradient-${Math.random().toString(36).substr(2, 9)}`, []);

//     return (
//         <motion.div
//             className={`absolute z-0  ${blur ? 'filter blur-xl' : ''} ${className}`}
//             style={{
//                 width: size,
//                 height: size,
//                 opacity,
//             }}
//             initial={{ rotate: enableRotation ? 0 : '0deg' }}
//             animate={{ rotate: enableRotation ? 360 : '0deg' }}
//             transition={{
//                 repeat: Infinity,
//                 duration: rotationDuration,
//                 ease: 'linear',
//             }}
//             aria-hidden='true'
//         >
//             <svg
//                 viewBox='0 0 200 200'
//                 xmlns='http://www.w3.org/2000/svg'
//                 className='w-full h-full'
//                 preserveAspectRatio='xMidYMid meet'
//             >
//                 <defs>
//                     <radialGradient
//                         id={gradientId}
//                         cx={gradientCenter[0]}
//                         cy={gradientCenter[1]}
//                         r={gradientSpread}
//                         gradientUnits='userSpaceOnUse'
//                     >
//                         {colors.map((color, index) => (
//                             <stop key={index} offset={`${(index / (colors.length - 1)) * 100}%`} stopColor={color} />
//                         ))}
//                     </radialGradient>
//                 </defs>

//                 <motion.path
//                     fill={`url(#${gradientId})`}
//                     d={defaultShapes[0]}
//                     transform='translate(100 100)'
//                     animate={
//                         enableMorph
//                             ? {
//                                   d: defaultShapes,
//                                   filter: ['url(#glow)', 'url(#soften)', 'url(#glow)'],
//                               }
//                             : {}
//                     }
//                     transition={{
//                         duration: morphDuration,
//                         repeat: Infinity,
//                         repeatType: 'mirror',
//                         ease: 'easeInOut',
//                     }}
//                 />

//                 {/* Glow effect filters */}
//                 <defs>
//                     <filter id='glow' x='-30%' y='-30%' width='160%' height='160%'>
//                         <feGaussianBlur stdDeviation='5' result='blur' />
//                         <feComposite in='SourceGraphic' in2='blur' operator='over' />
//                     </filter>
//                     <filter id='soften'>
//                         <feGaussianBlur stdDeviation='2' />
//                     </filter>
//                 </defs>
//             </svg>
//         </motion.div>
//     );
// }

import { motion, useAnimation } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

// Enhanced color palettes for different themes
const colorPalettes = {
    aurora: [
        'hsla(256, 92%, 60%, 0.9)', // Vibrant purple-blue
        'hsla(283, 79%, 65%, 0.85)', // Soft purple
        'hsla(299, 90%, 74%, 0.8)', // Pinkish purple
        'hsla(170, 91%, 78%, 0.8)', // Aqua
        'hsla(216, 82%, 62%, 0.85)', // Blue
    ],
    sunset: [
        'hsla(357, 95%, 73%, 0.9)', // Bright pink-red
        'hsla(25, 95%, 65%, 0.85)', // Orange
        'hsla(45, 90%, 70%, 0.8)', // Yellow-orange
        'hsla(60, 85%, 75%, 0.75)', // Golden yellow
        'hsla(15, 88%, 68%, 0.9)', // Coral
    ],
    ocean: [
        'hsla(216, 82%, 62%, 0.85)', // Blue
        'hsla(194, 85%, 65%, 0.8)', // Sky blue
        'hsla(170, 91%, 78%, 0.8)', // Aqua
        'hsla(150, 71%, 68%, 0.85)', // Teal
        'hsla(200, 80%, 70%, 0.75)', // Light blue
    ],
    forest: [
        'hsla(150, 71%, 68%, 0.85)', // Teal
        'hsla(120, 65%, 60%, 0.8)', // Green
        'hsla(76, 75%, 63%, 0.9)', // Lime green
        'hsla(90, 70%, 65%, 0.85)', // Light green
        'hsla(160, 75%, 70%, 0.8)', // Mint
    ],
    cosmic: [
        'hsla(256, 92%, 60%, 0.9)', // Vibrant purple-blue
        'hsla(291, 78%, 62%, 0.85)', // Purple-magenta
        'hsla(320, 85%, 70%, 0.8)', // Hot pink
        'hsla(280, 88%, 68%, 0.85)', // Violet
        'hsla(240, 90%, 72%, 0.8)', // Indigo
    ],
};

// More organic and varied blob shapes
const blobShapes = [
    'M45.3,-48.4C61.3,-40.5,78.7,-28.7,85.7,-11.7C92.7,5.3,89.4,27.5,76.4,38.5C63.3,49.5,40.6,49.3,21.9,53.1C3.1,57,-11.6,64.8,-23.7,61.8C-35.8,58.9,-45.2,45.2,-51,31.3C-56.8,17.4,-59,3.3,-59.7,-13.6C-60.5,-30.6,-59.7,-50.4,-49.5,-59.3C-39.3,-68.1,-19.6,-66,-2.5,-63C14.6,-60.1,29.3,-56.2,45.3,-48.4Z',
    'M48.1,-56.4C62,-45.7,72.7,-30.2,75.2,-13.6C77.7,2.9,71.9,20.6,61.3,32.1C50.7,43.7,35.3,49.2,20.3,53.7C5.3,58.3,-9.3,62.1,-25.7,60.5C-42,58.9,-60.2,52,-71.5,38.4C-82.9,24.7,-87.5,4.2,-80.5,-10.5C-73.5,-25.3,-55,-34.3,-39.6,-44.8C-24.3,-55.2,-12.1,-67.1,2.5,-70.1C17.1,-73,34.2,-67.1,48.1,-56.4Z',
    'M52.5,-58.2C67.5,-50,78.9,-32.9,77.7,-17C76.6,-1.1,63,13.7,51.5,26C39.9,38.3,30.5,48.1,18.2,54.7C5.8,61.3,-9.5,64.7,-21.7,60.1C-34,55.4,-43.2,42.8,-52.1,29.2C-61.1,15.6,-69.7,0.9,-71.3,-16.4C-72.8,-33.7,-67.3,-53.6,-54.2,-62.2C-41.1,-70.8,-20.6,-68.1,-0.9,-67C18.7,-66,37.5,-66.5,52.5,-58.2Z',
];

// Enhanced AnimatedBlob component
export default function AnimatedBlob({
    size = 500,
    rotationDuration = 30,
    morphDuration = 15,
    colors = colorPalettes.aurora,
    palette = 'aurora',
    gradientSpread = '120%',
    gradientCenter = ['50%', '50%'],
    opacity = 1,
    className = '',
    enableRotation = true,
    enableMorph = true,
    enableGlow = true,
    enablePulse = false,
    blur = false,
    intensity = 1,
    animationDelay = 0,
    interactive = false,
    zIndex = 0,
}) {
    const [isHovered, setIsHovered] = useState(false);
    const controls = useAnimation();

    // Use predefined palette or custom colors
    const finalColors = palette && colorPalettes[palette] ? colorPalettes[palette] : colors;

    // Generate unique gradient ID
    const gradientId = useMemo(() => `blobGradient-${Math.random().toString(36).substr(2, 9)}`, []);

    // Generate unique filter IDs
    const glowFilterId = useMemo(() => `glowFilter-${Math.random().toString(36).substr(2, 9)}`, []);

    const softenFilterId = useMemo(() => `softenFilter-${Math.random().toString(36).substr(2, 9)}`, []);

    // Enhanced animation variants
    const variants = {
        initial: {
            scale: 0.8,
            opacity: 0,
            rotate: 0,
        },
        animate: {
            scale: 1,
            opacity: opacity,
            rotate: enableRotation ? 360 : 0,
            transition: {
                scale: { duration: 1, ease: 'easeOut', delay: animationDelay },
                opacity: { duration: 1, ease: 'easeOut', delay: animationDelay },
                rotate: {
                    duration: rotationDuration,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: animationDelay,
                },
            },
        },
        hover: interactive
            ? {
                  scale: 1.1,
                  transition: { duration: 0.3, ease: 'easeOut' },
              }
            : {},
        pulse: enablePulse
            ? {
                  scale: [1, 1.05, 1],
                  opacity: [opacity, opacity * 0.8, opacity],
                  transition: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                  },
              }
            : {},
    };

    // Path morphing animation
    const pathVariants = {
        animate: enableMorph
            ? {
                  d: blobShapes,
                  transition: {
                      duration: morphDuration,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      ease: 'easeInOut',
                      delay: animationDelay * 0.5,
                  },
              }
            : {},
    };

    useEffect(() => {
        if (enablePulse) {
            controls.start('pulse');
        }
    }, [enablePulse, controls]);

    return (
        <motion.div
            className={`absolute ${blur ? 'blur-xl' : ''} ${interactive ? 'cursor-pointer' : ''} ${className}`}
            style={{
                width: size,
                height: size,
                zIndex: zIndex,
            }}
            variants={variants}
            initial='initial'
            animate={['animate', enablePulse ? 'pulse' : '']}
            whileHover={interactive ? 'hover' : {}}
            onHoverStart={() => interactive && setIsHovered(true)}
            onHoverEnd={() => interactive && setIsHovered(false)}
            aria-hidden='true'
        >
            <svg
                viewBox='0 0 200 200'
                xmlns='http://www.w3.org/2000/svg'
                className='w-full h-full'
                preserveAspectRatio='xMidYMid meet'
            >
                <defs>
                    {/* Enhanced gradient with more stops for smoother transitions */}
                    <radialGradient
                        id={gradientId}
                        cx={gradientCenter[0]}
                        cy={gradientCenter[1]}
                        r={gradientSpread}
                        gradientUnits='userSpaceOnUse'
                    >
                        {finalColors.map((color, index) => {
                            const offset = (index / (finalColors.length - 1)) * 100;
                            // Add intermediate stops for smoother gradients
                            return <stop key={index} offset={`${offset}%`} stopColor={color} stopOpacity={intensity} />;
                        })}
                    </radialGradient>

                    {/* Enhanced glow effect */}
                    {enableGlow && (
                        <filter id={glowFilterId} x='-50%' y='-50%' width='200%' height='200%'>
                            <feGaussianBlur stdDeviation='8' result='coloredBlur' />
                            <feMerge>
                                <feMergeNode in='coloredBlur' />
                                <feMergeNode in='SourceGraphic' />
                            </feMerge>
                        </filter>
                    )}

                    {/* Soften filter for smoother edges */}
                    <filter id={softenFilterId} x='-20%' y='-20%' width='140%' height='140%'>
                        <feGaussianBlur stdDeviation='3' result='softened' />
                        <feComposite in='SourceGraphic' in2='softened' operator='over' />
                    </filter>

                    {/* Additional noise filter for texture */}
                    <filter id='noise' x='0%' y='0%' width='100%' height='100%'>
                        <feTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch' />
                        <feBlend in='SourceGraphic' in2='BackgroundImage' mode='multiply' />
                    </filter>
                </defs>

                {/* Main blob path with enhanced animations */}
                <path
                    fill={`url(#${gradientId})`}
                    d={blobShapes[0]}
                    transform='translate(100 100)'
                    variants={pathVariants}
                    // animate='animate'
                    filter={enableGlow ? `url(#${glowFilterId})` : `url(#${softenFilterId})`}
                    style={{
                        filter: isHovered && interactive ? `url(#${glowFilterId}) brightness(1.2)` : undefined,
                    }}
                />

                {/* Optional overlay for enhanced visual depth */}
                {intensity > 1 && (
                    <motion.path
                        fill={`url(#${gradientId})`}
                        d={blobShapes[1] || blobShapes[0]}
                        transform='translate(100 100)'
                        variants={pathVariants}
                        animate='animate'
                        opacity={0.3}
                        filter={`url(#${softenFilterId})`}
                        style={{
                            mixBlendMode: 'screen',
                        }}
                    />
                )}
            </svg>
        </motion.div>
    );
}
