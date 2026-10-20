export const style = `
    :root {
        /****************** Basics  ******************/
        overflow-wrap: break-word;
        text-size-adjust: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        /****************** Colors variables  ******************/
        /* Gray alpha (light mode) */
        --tt-gray-light-a-50: rgba(56, 56, 56, 0.04);
        --tt-gray-light-a-100: rgba(15, 22, 36, 0.05);
        --tt-gray-light-a-200: rgba(37, 39, 45, 0.1);
        --tt-gray-light-a-300: rgba(47, 50, 55, 0.2);
        --tt-gray-light-a-400: rgba(40, 44, 51, 0.42);
        --tt-gray-light-a-500: rgba(52, 55, 60, 0.64);
        --tt-gray-light-a-600: rgba(36, 39, 46, 0.78);
        --tt-gray-light-a-700: rgba(35, 37, 42, 0.87);
        --tt-gray-light-a-800: rgba(30, 32, 36, 0.95);
        --tt-gray-light-a-900: rgba(29, 30, 32, 0.98);

        /* Gray (light mode) */
        --tt-gray-light-50: rgba(250, 250, 250, 1);
        --tt-gray-light-100: rgba(244, 244, 245, 1);
        --tt-gray-light-200: rgba(234, 234, 235, 1);
        --tt-gray-light-300: rgba(213, 214, 215, 1);
        --tt-gray-light-400: rgba(166, 167, 171, 1);
        --tt-gray-light-500: rgba(125, 127, 130, 1);
        --tt-gray-light-600: rgba(83, 86, 90, 1);
        --tt-gray-light-700: rgba(64, 65, 69, 1);
        --tt-gray-light-800: rgba(44, 45, 48, 1);
        --tt-gray-light-900: rgba(34, 35, 37, 1);

        /* Gray alpha (dark mode) */
        --tt-gray-dark-a-50: rgba(232, 232, 253, 0.05);
        --tt-gray-dark-a-100: rgba(231, 231, 243, 0.07);
        --tt-gray-dark-a-200: rgba(238, 238, 246, 0.11);
        --tt-gray-dark-a-300: rgba(239, 239, 245, 0.22);
        --tt-gray-dark-a-400: rgba(244, 244, 255, 0.37);
        --tt-gray-dark-a-500: rgba(236, 238, 253, 0.5);
        --tt-gray-dark-a-600: rgba(247, 247, 253, 0.64);
        --tt-gray-dark-a-700: rgba(251, 251, 254, 0.75);
        --tt-gray-dark-a-800: rgba(253, 253, 253, 0.88);
        --tt-gray-dark-a-900: rgba(255, 255, 255, 0.96);

        /* Gray (dark mode) */
        --tt-gray-dark-50: rgba(25, 25, 26, 1);
        --tt-gray-dark-100: rgba(32, 32, 34, 1);
        --tt-gray-dark-200: rgba(45, 45, 47, 1);
        --tt-gray-dark-300: rgba(70, 70, 73, 1);
        --tt-gray-dark-400: rgba(99, 99, 105, 1);
        --tt-gray-dark-500: rgba(124, 124, 131, 1);
        --tt-gray-dark-600: rgba(163, 163, 168, 1);
        --tt-gray-dark-700: rgba(192, 192, 195, 1);
        --tt-gray-dark-800: rgba(224, 224, 225, 1);
        --tt-gray-dark-900: rgba(245, 245, 245, 1);

        /* Brand colors */
        --tt-brand-color-50: rgba(239, 238, 255, 1);
        --tt-brand-color-100: rgba(222, 219, 255, 1);
        --tt-brand-color-200: rgba(195, 189, 255, 1);
        --tt-brand-color-300: rgba(157, 138, 255, 1);
        --tt-brand-color-400: rgba(122, 82, 255, 1);
        --tt-brand-color-500: rgba(98, 41, 255, 1);
        --tt-brand-color-600: rgba(84, 0, 229, 1);
        --tt-brand-color-700: rgba(75, 0, 204, 1);
        --tt-brand-color-800: rgba(56, 0, 153, 1);
        --tt-brand-color-900: rgba(43, 25, 102, 1);
        --tt-brand-color-950: hsla(257, 100%, 9%, 1);

        /* Green */
        --tt-color-green-inc-5: hsla(129, 100%, 97%, 1);
        --tt-color-green-inc-4: hsla(129, 100%, 92%, 1);
        --tt-color-green-inc-3: hsla(131, 100%, 86%, 1);
        --tt-color-green-inc-2: hsla(133, 98%, 78%, 1);
        --tt-color-green-inc-1: hsla(137, 99%, 70%, 1);
        --tt-color-green-base: hsla(147, 99%, 50%, 1);
        --tt-color-green-dec-1: hsla(147, 97%, 41%, 1);
        --tt-color-green-dec-2: hsla(146, 98%, 32%, 1);
        --tt-color-green-dec-3: hsla(146, 100%, 24%, 1);
        --tt-color-green-dec-4: hsla(144, 100%, 16%, 1);
        --tt-color-green-dec-5: hsla(140, 100%, 9%, 1);

        /* Yellow */
        --tt-color-yellow-inc-5: hsla(50, 100%, 97%, 1);
        --tt-color-yellow-inc-4: hsla(50, 100%, 91%, 1);
        --tt-color-yellow-inc-3: hsla(50, 100%, 84%, 1);
        --tt-color-yellow-inc-2: hsla(50, 100%, 77%, 1);
        --tt-color-yellow-inc-1: hsla(50, 100%, 68%, 1);
        --tt-color-yellow-base: hsla(52, 100%, 50%, 1);
        --tt-color-yellow-dec-1: hsla(52, 100%, 41%, 1);
        --tt-color-yellow-dec-2: hsla(52, 100%, 32%, 1);
        --tt-color-yellow-dec-3: hsla(52, 100%, 24%, 1);
        --tt-color-yellow-dec-4: hsla(51, 100%, 16%, 1);
        --tt-color-yellow-dec-5: hsla(50, 100%, 9%, 1);

        /* Red */
        --tt-color-red-inc-5: hsla(11, 100%, 96%, 1);
        --tt-color-red-inc-4: hsla(11, 100%, 88%, 1);
        --tt-color-red-inc-3: hsla(10, 100%, 80%, 1);
        --tt-color-red-inc-2: hsla(9, 100%, 73%, 1);
        --tt-color-red-inc-1: hsla(7, 100%, 64%, 1);
        --tt-color-red-base: hsla(7, 100%, 54%, 1);
        --tt-color-red-dec-1: hsla(7, 100%, 41%, 1);
        --tt-color-red-dec-2: hsla(5, 100%, 32%, 1);
        --tt-color-red-dec-3: hsla(4, 100%, 24%, 1);
        --tt-color-red-dec-4: hsla(3, 100%, 16%, 1);
        --tt-color-red-dec-5: hsla(1, 100%, 9%, 1);

        /* Basic colors */
        --white: rgba(255, 255, 255, 1);
        --black: rgba(14, 14, 17, 1);
        --transparent: rgba(255, 255, 255, 0);

        /****************** Shadow variables  ******************/
        /* Shadows Light */
        --tt-shadow-elevated-md: 0px 16px 48px 0px rgba(17, 24, 39, 0.04), 0px 12px 24px 0px rgba(17, 24, 39, 0.04),
            0px 6px 8px 0px rgba(17, 24, 39, 0.02), 0px 2px 3px 0px rgba(17, 24, 39, 0.02);

        /************************************************** Radius variables     **************************************************/
        --tt-radius-xxs: 0.125rem; /* 2px */
        --tt-radius-xs: 0.25rem; /* 4px */
        --tt-radius-sm: 0.375rem; /* 6px */
        --tt-radius-md: 0.5rem; /* 8px */
        --tt-radius-lg: 0.75rem; /* 12px */
        --tt-radius-xl: 1rem; /* 16px */

        /************************************************** Transition variables     **************************************************/
        --tt-transition-duration-short: 0.1s;
        --tt-transition-duration-default: 0.2s;
        --tt-transition-duration-long: 0.64s;
        --tt-transition-easing-default: cubic-bezier(0.46, 0.03, 0.52, 0.96);
        --tt-transition-easing-cubic: cubic-bezier(0.65, 0.05, 0.36, 1);
        --tt-transition-easing-quart: cubic-bezier(0.77, 0, 0.18, 1);
        --tt-transition-easing-circ: cubic-bezier(0.79, 0.14, 0.15, 0.86);
        --tt-transition-easing-back: cubic-bezier(0.68, -0.55, 0.27, 1.55);

        /****************** Contrast variables  ******************/
        --tt-accent-contrast: 8%;
        --tt-destructive-contrast: 8%;
        --tt-foreground-contrast: 8%;
    }

    :root,
    :root *,
    :root ::before,
    :root ::after {
        box-sizing: border-box;
        transition: none var(--tt-transition-duration-default) var(--tt-transition-easing-default);
    }

    :root {
        /************************************************** Global colors   **************************************************/
        /* Global colors - Light mode */
        --tt-bg-color: var(--white);
        --tt-border-color: var(--tt-gray-light-a-200);
        --tt-border-color-tint: var(--tt-gray-light-a-100);
        --tt-sidebar-bg-color: var(--tt-gray-light-100);
        --tt-scrollbar-color: var(--tt-gray-light-a-200);
        --tt-cursor-color: var(--tt-brand-color-500);
        --tt-selection-color: rgba(157, 138, 255, 0.2);
        --tt-card-bg-color: var(--white);
        --tt-card-border-color: var(--tt-gray-light-a-100);
    }

    /* Global colors - Dark mode */
    .dark {
        --tt-bg-color: var(--black);
        --tt-border-color: var(--tt-gray-dark-a-200);
        --tt-border-color-tint: var(--tt-gray-dark-a-100);
        --tt-sidebar-bg-color: var(--tt-gray-dark-100);
        --tt-scrollbar-color: var(--tt-gray-dark-a-200);
        --tt-cursor-color: var(--tt-brand-color-400);
        --tt-selection-color: rgba(122, 82, 255, 0.2);
        --tt-card-bg-color: var(--tt-gray-dark-50);
        --tt-card-border-color: var(--tt-gray-dark-a-50);
        --tt-shadow-elevated-md: 0px 16px 48px 0px rgba(0, 0, 0, 0.5), 0px 12px 24px 0px rgba(0, 0, 0, 0.24),
            0px 6px 8px 0px rgba(0, 0, 0, 0.22), 0px 2px 3px 0px rgba(0, 0, 0, 0.12);
    }

    /* Text colors */
    :root {
        --tt-color-text-gray: hsl(45, 2%, 46%);
        --tt-color-text-brown: hsl(19, 31%, 47%);
        --tt-color-text-orange: hsl(30, 89%, 45%);
        --tt-color-text-yellow: hsl(38, 62%, 49%);
        --tt-color-text-green: hsl(148, 32%, 39%);
        --tt-color-text-blue: hsl(202, 54%, 43%);
        --tt-color-text-purple: hsl(274, 32%, 54%);
        --tt-color-text-pink: hsl(328, 49%, 53%);
        --tt-color-text-red: hsl(2, 62%, 55%);

        --tt-color-text-gray-contrast: hsla(39, 26%, 26%, 0.15);
        --tt-color-text-brown-contrast: hsla(18, 43%, 69%, 0.35);
        --tt-color-text-orange-contrast: hsla(24, 73%, 55%, 0.27);
        --tt-color-text-yellow-contrast: hsla(44, 82%, 59%, 0.39);
        --tt-color-text-green-contrast: hsla(126, 29%, 60%, 0.27);
        --tt-color-text-blue-contrast: hsla(202, 54%, 59%, 0.27);
        --tt-color-text-purple-contrast: hsla(274, 37%, 64%, 0.27);
        --tt-color-text-pink-contrast: hsla(331, 60%, 71%, 0.27);
        --tt-color-text-red-contrast: hsla(8, 79%, 79%, 0.4);
    }

    .dark {
        --tt-color-text-gray: hsl(0, 0%, 61%);
        --tt-color-text-brown: hsl(18, 35%, 58%);
        --tt-color-text-orange: hsl(25, 53%, 53%);
        --tt-color-text-yellow: hsl(36, 54%, 55%);
        --tt-color-text-green: hsl(145, 32%, 47%);
        --tt-color-text-blue: hsl(202, 64%, 52%);
        --tt-color-text-purple: hsl(270, 55%, 62%);
        --tt-color-text-pink: hsl(329, 57%, 58%);
        --tt-color-text-red: hsl(1, 69%, 60%);

        --tt-color-text-gray-contrast: hsla(0, 0%, 100%, 0.09);
        --tt-color-text-brown-contrast: hsla(17, 45%, 50%, 0.25);
        --tt-color-text-orange-contrast: hsla(27, 82%, 53%, 0.2);
        --tt-color-text-yellow-contrast: hsla(35, 49%, 47%, 0.2);
        --tt-color-text-green-contrast: hsla(151, 55%, 39%, 0.2);
        --tt-color-text-blue-contrast: hsla(202, 54%, 43%, 0.2);
        --tt-color-text-purple-contrast: hsla(271, 56%, 60%, 0.18);
        --tt-color-text-pink-contrast: hsla(331, 67%, 58%, 0.22);
        --tt-color-text-red-contrast: hsla(0, 67%, 60%, 0.25);
    }

    /* Highlight colors */
    :root {
        --tt-color-highlight-yellow: #faf594;
        --tt-color-highlight-green: #99f9bb;
        --tt-color-highlight-blue: #9ab2ff;
        --tt-color-highlight-purple: #c697f9;
        --tt-color-highlight-red: hsl(356, 90%, 77%);
        --tt-color-highlight-gray: rgb(190, 190, 188);
        --tt-color-highlight-brown: rgb(132, 97, 97);
        --tt-color-highlight-orange: rgb(252, 176, 99);
        --tt-color-highlight-pink: rgb(222, 96, 212);

        --tt-color-highlight-yellow-contrast: #faf594;
        --tt-color-highlight-green-contrast: #94feb7;
        --tt-color-highlight-blue-contrast: #9ed7fe;
        --tt-color-highlight-purple-contrast: #c99cfc;
        --tt-color-highlight-red-contrast: #ffccd0;
        --tt-color-highlight-gray-contrast: rgba(84, 72, 49, 0.15);
        --tt-color-highlight-brown-contrast: rgba(210, 162, 141, 0.35);
        --tt-color-highlight-orange-contrast: rgba(224, 124, 57, 0.27);
        --tt-color-highlight-pink-contrast: rgba(225, 136, 179, 0.27);
    }

    .dark {
        --tt-color-highlight-yellow: #b1a205;
        --tt-color-highlight-green: #03a73d;
        --tt-color-highlight-blue: #046cb1;
        --tt-color-highlight-purple: #5b04b8;
        --tt-color-highlight-red: #9e030e;
        --tt-color-highlight-gray: rgb(133, 133, 131);
        --tt-color-highlight-brown: rgb(109, 66, 66);
        --tt-color-highlight-orange: rgb(171, 74, 5);
        --tt-color-highlight-pink: rgb(126, 5, 116);

        --tt-color-highlight-yellow-contrast: #58531e;
        --tt-color-highlight-green-contrast: #47855d;
        --tt-color-highlight-blue-contrast: #5e86a1;
        --tt-color-highlight-purple-contrast: #4c3564;
        --tt-color-highlight-red-contrast: #643539;
        --tt-color-highlight-gray-contrast: rgba(255, 255, 255, 0.094);
        --tt-color-highlight-brown-contrast: rgba(184, 101, 69, 0.25);
        --tt-color-highlight-orange-contrast: rgba(233, 126, 37, 0.2);
        --tt-color-highlight-pink-contrast: rgba(220, 76, 145, 0.22);
    }

    /* List styles */
    ul,
    ol {
        padding: 0 1rem;
        margin: 1.25rem 1rem 1.25rem 0.4rem;
    }

    ul li p,
    ol li p {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
    }

    /* Code and preformatted text styles */
    code {
        background-color: #f3f7f7;
        border-radius: 0.4rem;
        color: var(--black);
        font-size: 0.85rem;
        padding: 0.25em 0.3em;
    }

    pre {
        background: #f3f7f7;
        border-radius: 0.5rem;
        color: black;
        font-family: 'JetBrainsMono', monospace;
        margin: 1.5rem 0;
        padding: 0.75rem 1rem;
    }

    pre code {
        background: none;
        color: inherit;
        font-size: 0.8rem;
        padding: 0;
    }

    /*
        blockquote {
            border-left: 4px solid #D1D5DB;
            margin: 1.5rem 0;
            padding-left: 0.6rem;
        }
        */

    hr {
        border: none;
        border-top: 1px solid #9ca3af;
        margin: 2rem 0;
    }

    ul li label input[type='checkbox'] {
        appearance: none; /* reset native styling */
        width: 1rem;
        height: 1rem;
        border: 2px solid #2940d3; /* black border */
        border-radius: 0.25rem; /* optional: rounded corners */
        display: inline-block;
        vertical-align: middle;
    }

    ul li label input[type='checkbox']:checked {
        background-color: #2940d3; /* fill when checked */
        border-color: #2940d3;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'><path d='M16.7 5.3a1 1 0 0 0-1.4-1.4L8 11.17 4.7 7.88a1 1 0 0 0-1.4 1.42l4 4a1 1 0 0 0 1.4 0l8-8z'/></svg>");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 1rem 1rem;
    }

    body {
        font-family: 'Inter', sans-serif;
    }

    /* =====================       TEXT DECORATION       ===================== */
    a {
        text-decoration: underline;
    }

    s {
        text-decoration: line-through;
    }

    u {
        text-decoration: underline;
    }

    /* =====================       BLOCKQUOTE       ===================== */
    blockquote {
        position: relative;
        padding-left: 1em;
        padding-top: 0.3em;
        margin: 1.5rem 0;
    }

    blockquote p {
        margin-top: 0;
    }

    blockquote::before,
    blockquote.is-empty::before {
        position: absolute;
        bottom: 0;
        left: 0;
        top: 0;
        height: 100%;
        width: 0.25em;
        background-color: rgba(34, 35, 37, 1);
        content: '';
        border-radius: 0;
    }

    /* =====================       EMOJI       ===================== */
    .tiptap.ProseMirror [data-type='emoji'] img {
        display: inline-block;
        width: 1.25em;
        height: 1.25em;
        cursor: text;
    }

    /* =====================       HORIZONTAL RULE       ===================== */
    hr {
        border: none;
        height: 1px;
        background-color: var(--tt-gray-light-a-200);
    }

    /* =====================       LINKS       ===================== */
    a {
        color: var(--tt-brand-color-500);
        text-decoration: underline;
    }

    /* =====================       LISTS       ===================== */
    ul,
    ol {
        margin-top: 1.5em;
        margin-bottom: 1.5em;
        padding-left: 1.5em;
    }

    ol:first-child,
    ul:first-child {
        margin-top: 0;
    }

    ol:last-child,
    ul:last-child {
        margin-bottom: 0;
    }

    ol ol,
    ul ul,
    ol ul,
    ul ol {
        margin-top: 0;
        margin-bottom: 0;
    }

    li p {
        margin-top: 0;
    }

    /* Ordered lists */
    ol {
        list-style: decimal;
    }

    ol ol {
        list-style: lower-alpha;
    }

    ol ol ol {
        list-style: lower-roman;
    }

    /* Unordered lists */
    ul:not([data-type='taskList']) {
        list-style: disc;
    }

    ul:not([data-type='taskList']) ul {
        list-style: circle;
    }

    ul:not([data-type='taskList']) ul ul {
        list-style: disc;
    }

    /* Task lists */
    ul[data-type='taskList'] {
        padding-left: 0.25em;
    }

    ul[data-type='taskList'] li {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }

    ul[data-type='taskList'] li:not(:has(> p:first-child)) {
        list-style-type: none;
    }

    ul[data-type='taskList'] li[data-checked='true'] > div > p {
        opacity: 0.5;
        text-decoration: line-through;
    }

    ul[data-type='taskList'] li[data-checked='true'] > div > p span {
        text-decoration: line-through;
    }

    ul[data-type='taskList'] li label {
        position: relative;
        padding-top: 4px;
        padding-right: 8px;
    }

    ul[data-type='taskList'] li label input[type='checkbox'] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }

    ul[data-type='taskList'] li label span {
        display: block;
        width: 1em;
        height: 1em;
        border: 1px solid var(--tt-gray-light-a-200);
        border-radius: 0.25rem;
        position: relative;
        cursor: pointer;
        background-color: var(--tt-gray-light-a-100);
        transition: background-color 80ms ease-out, border-color 80ms ease-out;
    }

    ul[data-type='taskList'] li label span::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 0.75em;
        height: 0.75em;
        background-color: white;
        opacity: 0;
        -webkit-mask: url('data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M21.4142%204.58579C22.1953%205.36683%2022.1953%206.63317%2021.4142%207.41421L10.4142%2018.4142C9.63317%2019.1953%208.36684%2019.1953%207.58579%2018.4142L2.58579%2013.4142C1.80474%2012.6332%201.80474%2011.3668%202.58579%2010.5858C3.36683%209.80474%204.63317%209.80474%205.41421%2010.5858L9%2014.1716L18.5858%204.58579C19.3668%203.80474%2020.6332%203.80474%2021.4142%204.58579Z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E')
            center/contain no-repeat;
        mask: url('data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M21.4142%204.58579C22.1953%205.36683%2022.1953%206.63317%2021.4142%207.41421L10.4142%2018.4142C9.63317%2019.1953%208.36684%2019.1953%207.58579%2018.4142L2.58579%2013.4142C1.80474%2012.6332%201.80474%2011.3668%202.58579%2010.5858C3.36683%209.80474%204.63317%209.80474%205.41421%2010.5858L9%2014.1716L18.5858%204.58579C19.3668%203.80474%2020.6332%203.80474%2021.4142%204.58579Z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E')
            center/contain no-repeat;
    }

    ul[data-type='taskList'] li label input[type='checkbox']:checked + span {
        background: var(--tt-gray-light-a-900);
        border-color: var(--tt-gray-light-a-900);
    }

    ul[data-type='taskList'] li label input[type='checkbox']:checked + span::before {
        opacity: 1;
    }

    ul[data-type='taskList'] li div {
        flex: 1 1 0%;
        min-width: 0;
    }

    img {
        max-width: 100%;
        height: auto;
        display: block;
    }

    img:not([data-type='emoji'] img) {
        margin: 2rem 0;
        outline: 0.125rem solid transparent;
        border-radius: 0.25rem;
    }

    img:not([data-type='emoji'] img).ProseMirror-selectednode {
        outline-color: rgba(98, 41, 255, 1);
    }

    img {
        margin: 0;
    }

    @media print {
        /* Prevents widows and orphans (single lines at the start/end of a page) */
        p,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        li {
            page-break-inside: avoid;
            -webkit-column-break-inside: avoid;
        }

        /* Prevents the entire document from breaking at the end of a page with an empty space */
        body {
            page-break-after: always;
        }

        /* Ensures that large content like blockquotes or images stay on one page if possible */
        blockquote,
        pre,
        img,
        figure,
        table {
            page-break-inside: avoid;
        }

        /* Avoids blank pages at the end of the document */
        html,
        body {
            height: 100%;
        }
    }

`;

export const style2 = `
  html, body {
    margin: 0;
    padding: 0;
  }

  :root {
    --tt-color-highlight-yellow: #ffd700;
    --tt-color-highlight-green: #a2f2a2;
    --tt-color-highlight-blue: #a2d7f2;
    --tt-color-highlight-pink: #f2a2d7;
    --tt-color-highlight-red: #f2a2a2;
    --tt-color-highlight-purple: #d7a2f2;
    --tt-color-highlight-gray: #e0e0e0;
    --tt-color-highlight-orange: #ffc07a;
    --tt-color-highlight-brown: #a0522d;
  }

  /****************** Basics ******************/
  * {
    overflow-wrap: break-word;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: #ffffff;
    color: #333333;
    margin: 0;
    padding: 20px;
  }

  /* Text decoration */
  a {
    text-decoration: underline;
    color: rgba(98, 41, 255, 1);
  }

  s {
    text-decoration: line-through;
  }

  u {
    text-decoration: underline;
  }

  /* Headings and paragraphs - Add a little space */
  h1, h2, h3, h4, h5, h6, p {
    margin-top: 0;
    margin-bottom: 0.8rem; /* Increased space for better readability */
  }

  /* Code and preformatted text styles */
  code {
    background-color: #F3F7F7;
    border-radius: 0.4rem;
    color: #0E0E11;
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: #F3F7F7;
    border-radius: 0.5rem;
    color: black;
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0; /* Slightly increased margin */
    padding: 0.75rem 1rem;
  }

  pre code {
    background: none;
    color: inherit;
    font-size: 0.8rem;
    padding: 0;
  }

  /* Blockquote */
  blockquote {
    position: relative;
    padding-left: 1em;
    padding-top: 0.3em;
    margin: 1.5rem 0; /* Slightly increased margin */
    min-height: 1.5rem;
  }

  blockquote p {
    margin-top: 0;
    margin-bottom: 0;
  }

  blockquote::before {
    position: absolute;
    bottom: 0;
    left: 0;
    top: 0;
    height: 100%;
    width: 0.25em;
    background-color: rgba(34, 35, 37, 1);
    content: '';
  }

  /* Lists - Add a little space between list items */
  ul, ol {
    margin-top: 0.8rem;
    margin-bottom: 0.8rem;
    padding-left: 1.5em;
  }

  ul ul, ol ol, ul ol, ol ul {
    margin-top: 0;
    margin-bottom: 0;
  }

  li p {
    margin-top: 0;
    margin-bottom: 0;
  }

  /* Task lists - Corrected Styles */
  ul[data-type="taskList"] {
    list-style: none;
    padding-left: 0;
  }

  ul[data-type="taskList"] li {
    display: flex;
    flex-direction: row;
    align-items: center; /* Changed to 'center' for better vertical alignment */
    margin-bottom: 0.5rem; /* Added space between tasks */
  }

  ul[data-type="taskList"] li[data-checked="true"] p {
    opacity: 0.6;
    text-decoration: line-through;
  }

  ul[data-type="taskList"] li label {
    position: relative;
    padding-right: 8px;
    cursor: pointer;
  }

  ul[data-type="taskList"] li label input[type="checkbox"] {
    display: none;
  }

  ul[data-type="taskList"] li label span {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1em;
    height: 1em;
    border: 1px solid rgba(234, 234, 235, 1);
    border-radius: 0.25rem;
    background-color: rgba(244, 244, 245, 1);
  }

  ul[data-type="taskList"] li label input[type="checkbox"]:checked + span {
    background-color: transparent;
    border: none;
  }

  ul[data-type="taskList"] li label input[type="checkbox"]:checked + span::before {
    content: "✅";
    color: #ffffff;
    font-size: 1em;
  }

  ul[data-type="taskList"] li label input[type="checkbox"] + span::before {
    content: ""; /* Removed the ⛔ character to show an empty box when not checked */
  }

  /* Other elements */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5rem auto;
  }

  hr {
    border: none;
    height: 1px;
    background-color: rgba(234, 234, 235, 1);
    margin: 2rem 0;
  }

  /* Print-specific styles */
  @media print {
    p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, img, figure, table {
      page-break-inside: avoid;
      -webkit-column-break-inside: avoid;
    }
  }
`;
