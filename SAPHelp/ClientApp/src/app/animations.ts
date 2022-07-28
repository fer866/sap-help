import { animate, query as q, state, style, transition, trigger, AnimationMetadata, AnimationQueryOptions, stagger } from "@angular/animations";

const query = (s: string,a: AnimationMetadata | AnimationMetadata[],o: AnimationQueryOptions | null | undefined = {optional:true})=>q(s,a,o);

export const fadeLoader =
  trigger('fadeLoader', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('.8s ease-in-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('.8s ease-in-out', style({ opacity: 0 }))
    ])
  ]);

export const slideToTop =
  trigger('slideToTop', [
      transition(':enter, * => *', [
          query(':enter', style({ transform: 'translateY(100%)', opacity: 0 })),
          query(':enter', stagger(120, [animate('.8s ease-out', style({ transform: 'translateY(0)', opacity: 1 }))]))
      ])
  ]);

export const slideFromRight =
  trigger('slideFromRight', [
      transition(':enter', [
          query(':enter', style({ transform: 'translateX(100%)', opacity: 0 }), { optional: true }),
          query(':enter', stagger(120, [animate('.8s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))]), { optional: true })
      ])
  ]);

export const fade = trigger('fade', [ 
    transition('* <=> *', [
      style({ opacity: 0 }),
      animate('.3s ease-in-out', style({opacity: 1}))
    ])
]);

export const expand =
  trigger('expand', [
      transition(':enter', [
          query('ul', [style({ height: 0, overflow: 'hidden' })], { optional: true }),
          query('ul', [animate('0.35s ease-in', style('*'))], { optional: true }),
      ]),
      transition(':leave', [
          query('ul', [animate('0.27s ease-out', style({ height: 0, overflow: 'hidden' }))], { optional: true }),
      ])
  ]);

export const rotate =
  trigger('rotate', [
      state('true', style({ transform: 'rotate(180deg)' })),
      state('false', style({ transform: 'rotate(0)' })),
      transition('* => *', animate('0.25s ease-in-out'))
  ]);

export const fadeIn = trigger('fadeIn', [
    state('in', style({ opacity: 1 })),
    transition(':enter', [
        style({ opacity: 0 }),
        animate(250)
    ]),
    transition(':leave', [
        animate(250, style({ opacity: 0 }))
    ])
]);

export const routeTransition = trigger('routeTransition', [
  transition('* => *', [
    query(':self', style({ overflow: 'hidden' })),
    query(':enter', style({ opacity: 0, position: 'absolute', width: '100%', overflow: 'hidden', transform: 'scale(.975)' })),
    query(':leave', style({ opacity: 1, position: 'absolute', width: '100%', overflow: 'hidden', transform: 'scale(1)' })),
    query(':leave', animate('0.2s ease-in', style({ opacity: 0, transform: 'scale(.975)' }))),
    query(':enter', animate('0.2s ease-out', style({ opacity: 1, transform: 'scale(1)' })))
  ])
]);

export const photo = trigger('photo', [
  transition(':enter', [
    query(':self', style({ background: 'none' })),
    query('.close, .bottom-details', style({ opacity: 0 })),
    query('.profile', style({
      width: '100px',
      height: '100px',
      'border-radius': '50%',
      overflow: 'hidden',
      transform: 'translate({{x}}px, {{y}}px)'
    })),
    query('.profile', [animate('0.35s ease-in', style({
      width: '100%',
      'max-width': '750px',
      'border-radius': '0',
      height: 'unset',
      transform: 'translate(0, 0)'
    }))]),
    query(':self', animate('0.35s ease-in', style({ background: '#303030' }))),
    query('.close, .bottom-details', animate('0.35s ease-in', style({ opacity: 1 })))
  ], { params: { x: 0, y: 0 } }),
  transition(':leave', [
    query('.close, .bottom-details', style({ opacity: 0 })),
    query(':self', animate('0.35s ease-in', style({ background: 'none' }))),
    query('.profile', [animate('0.35s ease-out', style({
      width: '100px',
      height: '100px',
      'border-radius': '50%',
      overflow: 'hidden',
      transform: 'translate({{x}}px, {{y}}px)'
    })), animate('0.35s ease-out', style({ opacity: 0 }))])
  ], { params: { x: 0, y: 0 } })
]);