import { ImageResponse } from 'next/og'

// Generated at build time, so there is no binary asset to keep in the repo.
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#16a34a',
          color: '#ffffff',
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '-0.05em',
          borderRadius: 7,
        }}
      >
        a
      </div>
    ),
    size
  )
}
