import { BlueSkillsApp } from '@/components/blueskills-app'

export default function Home() {
  return (
    <BlueSkillsApp
      limits={{
        textBytes: 1024 * 1024,
        fetchedArchiveBytes: 25 * 1024 * 1024,
        uploadBytes: 25 * 1024 * 1024,
        maxSkills: 5,
      }}
    />
  )
}
