type Props = {
  title: string
  paragraph: string
  center?: boolean
  width?: string
  mb?: string
}

export function SectionTitle({ title, paragraph, center, width = '570px', mb = '48px' }: Props) {
  return (
    <div
      className={`w-full ${center ? 'mx-auto text-center' : ''}`}
      style={{ maxWidth: width, marginBottom: mb }}
    >
      <h2 className="mb-4 text-3xl leading-tight! font-bold text-black sm:text-4xl md:text-[45px] dark:text-white">
        {title}
      </h2>
      <p className="text-body-color text-base leading-relaxed! md:text-lg">{paragraph}</p>
    </div>
  )
}
