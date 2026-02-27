import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Button, Input, Select, Card, CardContent } from '../ui'
import { roundDetailsSchema, type RoundDetailsSchema } from '../../schemas'
import { useRoundStore } from '../../stores/roundStore'
import { COURSE_DIFFICULTY_OPTIONS, WEATHER_OPTIONS, HOLES_OPTIONS } from '../../types'

export function RoundDetailsScreen() {
  const startRound = useRoundStore((state) => state.startRound)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoundDetailsSchema>({
    resolver: zodResolver(roundDetailsSchema),
    defaultValues: {
      playerName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      courseName: '',
      tournament: '',
      holes: 18,
      courseDifficulty: 'Standard',
      weather: 'Normal',
    },
  })

  const onSubmit = (data: RoundDetailsSchema) => {
    startRound(data)
  }

  const courseDifficultyOptions = COURSE_DIFFICULTY_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }))

  const weatherOptions = WEATHER_OPTIONS.map((opt) => ({
    value: opt,
    label: opt,
  }))

  const holesOptions = HOLES_OPTIONS.map((opt) => ({
    value: opt.toString(),
    label: opt === 9 ? '9 Holes' : '18 Holes',
  }))

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-h2 text-ink mb-2">Round Details</h2>
        <p className="font-mono text-xs text-pewter tracking-wide">
          Enter your round information to begin tracking shots
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card variant="stat" className="mb-6">
          <CardContent>
            {/* Player Name */}
            <div className="mb-5">
              <Input
                label="Player Name"
                placeholder="Enter your name"
                error={errors.playerName?.message}
                {...register('playerName')}
              />
            </div>

            {/* Date */}
            <div className="mb-5">
              <Input
                label="Date"
                type="date"
                error={errors.date?.message}
                {...register('date')}
              />
            </div>

            {/* Course Name */}
            <div className="mb-5">
              <Input
                label="Course Name"
                placeholder="e.g., Pebble Beach Golf Links"
                error={errors.courseName?.message}
                {...register('courseName')}
              />
            </div>

            {/* Tournament (Required) */}
            <div className="mb-5">
              <Input
                label="Tournament / Event"
                placeholder="e.g., Club Championship, Casual Round"
                error={errors.tournament?.message}
                {...register('tournament')}
              />
            </div>

            {/* Holes */}
            <div className="mb-5">
              <Select
                label="Number of Holes"
                options={holesOptions}
                error={errors.holes?.message}
                {...register('holes', {
                  valueAsNumber: true,
                  setValueAs: (value) => parseInt(value),
                })}
              />
            </div>

            {/* Course Difficulty */}
            <div className="mb-5">
              <Select
                label="Course Difficulty"
                options={courseDifficultyOptions}
                error={errors.courseDifficulty?.message}
                {...register('courseDifficulty')}
              />
            </div>

            {/* Weather */}
            <div className="mb-6">
              <Select
                label="Weather Conditions"
                options={weatherOptions}
                error={errors.weather?.message}
                {...register('weather')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Begin Round
        </Button>
      </form>
    </div>
  )
}
