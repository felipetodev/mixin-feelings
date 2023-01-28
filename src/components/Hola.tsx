import { useState } from 'react'
import { classifyFeelings } from '../services/cohere'
import { getPlaylistsByFeeling } from '../services/spotify'
import { successPrompt } from '../supabase/functions/prompts'
import { Button } from './shared/Button'

type playlist = {
	id: string
	name: string
	images: any[]
	href: string
}

const INITIAL_INPUT_STATE = {
	textarea: ''
}

export default function Hola(): JSX.Element {
	const [loading, setLoading] = useState<boolean>(false)
	const [input, setInput] = useState<{ textarea: string | number }>(INITIAL_INPUT_STATE)
	const [feeling, setFeeling] = useState<string>('')

	const [playlist, setPlaylist] = useState<playlist[] | null>(null)

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		try {
			setLoading(true)

			const { classifications } = await classifyFeelings(input.textarea)
			const { prediction: feeling } = classifications[0]

			setFeeling(feeling)

			const playlists = await getPlaylistsByFeeling(feeling)
			setPlaylist(playlists)
		} catch (err) {
			console.log(err)
		} finally {
			setLoading(false)
		}
	}

	const handleTextArea = ({ target }: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput({ 
			...input,
			[target.name]: target.value
		})
	}

	return (
		<form onSubmit={onSubmit} className='flex flex-col gap-5 relative'>
			<label htmlFor='feeling' className='font-bold'>
				Cuéntame, ¿cómo estuvo tu día?
			</label>

			<textarea
				id='feeling'
				className='text-black resize-none w-full h-44 p-5 rounded-md font-[600]'
				name='textarea'
				onChange={handleTextArea}
				disabled={loading}
			/>
			<Button label='submit' type='submit' disabled={loading} />
			{feeling && (
				<>
					<p className='text-xl text-white text-center p-3  bg-slate-800'>
						Asi que te sientes <span className='lowercase font-semibold'>{feeling}</span> hoy,{' '}
						<span className=' font-semibold'>
							pues tal vez quieras escuchar estas playlist que seleccionamos para tí.
						</span>
					</p>
					<iframe
						className='-rotate-[100deg] absolute bottom-5 -right-32 h-40 w-52 delete z-10'
						src='https://embed.lottiefiles.com/animation/84339'
					/>
				</>
			)}
			<div className='border border-red-400 flex gap-4'>
				{playlist &&
					playlist.map(({ id, name, href, images }: playlist) => {
						return (
							<>
								<div key={id}>
									<a href={href}>{name}</a>
									<img className='aspect-square object-cover' src={images[0].url} alt={name} />
								</div>
								<div>
									<button
										onClick={() => successPrompt({ label: feeling, text: input.textarea })}
									>	
										Good
									</button>
								</div>
							</>
						)
					})}
			</div>
		</form>
	)
}
