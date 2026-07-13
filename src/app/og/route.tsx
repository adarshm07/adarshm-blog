import { ImageResponse } from 'next/og'

export function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || 'adarshm.com'

  return new ImageResponse(
    (
      <div
        tw="flex flex-col w-full h-full justify-between bg-[#FAF6EF] p-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25px 25px, #E8E1D4 2%, transparent 0%), radial-gradient(circle at 75px 75px, #E8E1D4 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div tw="flex items-center">
          <div tw="h-4 w-4 rounded-full bg-[#4F8A8B] mr-4" />
          <span tw="text-2xl font-semibold text-[#8A8F9C]">adarshm.com</span>
        </div>
        <h2
          tw="flex text-6xl font-bold tracking-tight text-left text-[#2A2E3A]"
          style={{ lineHeight: 1.15 }}
        >
          {title}
        </h2>
        <span tw="text-2xl text-[#8A8F9C]">
          Adarsh M. — Software Engineer
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
