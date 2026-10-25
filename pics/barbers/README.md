# Barber portfolio photos

Each barber’s work is configured in their `portfolio` array in `data.ts`.
The arrays are intentionally empty until the correct photos are supplied.
Do not assign the shared lookbook photos to a barber without confirming authorship.

Add photos in subfolders such as `rc/`, `mark/`, and `rem/`. Import each photo
in `data.ts` using the same approach as the existing barber portraits:

```ts
import rcFade from './pics/barbers/rc/low-fade.webp'
```

Then add an entry to RC Flores’s portfolio:

```ts
portfolio: [
  {
    id: 'rc-low-fade',
    title: 'Low fade',
    category: 'Fades',
    image: rcFade,
    description: 'A low blend with a natural textured finish.',
  },
]
```

Use unique IDs and consistent category names (for example `Fades`, `Texture`,
`Classic`). Category filters appear automatically when more than one category
exists. Every thumbnail opens a larger view, and booking from that view carries
the cut title and description into the appointment’s editable notes. A profile
booking always preselects that barber. Keep images reasonably sized, ideally
WebP and under about 300 KB. Only use photos supplied with permission.
