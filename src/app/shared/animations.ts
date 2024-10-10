/**
 * Angular Animations
 * Import this file in your component
 * add animation to animations array
 * in template call it with "@trigger-name"
 */

import { animate, style, transition, trigger } from '@angular/animations';

const timing = '225ms ease';
const timingLogin = '400ms ease';

export const fadeIn = trigger('fadeIn', [
    transition(':enter', [style({ opacity: '0' }), animate(timing, style({ opacity: '1' }))]),
    transition(':leave', [style({ opacity: '1' }), animate(timing, style({ opacity: '0' }))]),
]);

export const fadeInLogin = trigger('fadeInLogin', [
    transition(':enter', [style({ opacity: '0' }), animate(timingLogin, style({ opacity: '1' }))]),
    transition(':leave', [style({ opacity: '1' }), animate(timingLogin, style({ opacity: '0' }))]),
]);

export const toggleWorkspace = trigger('toggleWorkspace', [
    transition(':enter', [
        style({ width: '0', opacity: 0 }),
        animate('0.2s ease-out', style({ width: '380px', opacity: 1 }))
    ]),
    transition(':leave', [
        animate('0.2s ease-out', style({ width: '0', opacity: 0 }))
    ])
]);

export const toggleThread = trigger('toggleThread', [
    transition(':enter', [
        style({ width: '0', opacity: 0 }),
        animate('0.2s ease', style({ width: '440px', opacity: 1 }))
    ]),
    transition(':leave', [
        animate('0.2s ease', style({ width: '0', opacity: 0 }))
    ])
]);

export const slideFromBottom = trigger('slideFromBottom', [
    transition(':enter', [style({ transform: 'translateY( 1000px)' }), animate('0.2s ease-out', style({ transform: 'translateY( 0)' }))]),
    transition(':leave', [style({ transform: 'translateY( 0)' }), animate('0.2s ease-out', style({ transform: 'translateY( 1000px)' }))]),
]);

export const toggleConversations = trigger('toggleConversations', [
    transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('0.2s ease', style({ height: '*', opacity: 1 }))
    ]),
    transition(':leave', [
        animate('0.2s ease', style({ height: '0', opacity: 0 })),
    ])
]);