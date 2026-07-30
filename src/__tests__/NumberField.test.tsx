import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberField } from '@/components/NumberField'

/**
 * The one component test — proof that UI can be tested too, not just maths.
 * `render` draws the component into a fake browser (jsdom); `screen` then looks
 * at what a user would actually see on the page.
 */

describe('NumberField', () => {
  it('shows the hint when there is nothing wrong', () => {
    render(<NumberField label="Margin" value="35" onChange={() => {}} hint="Used for break-even." />)

    expect(screen.getByText('Used for break-even.')).toBeInTheDocument()
  })

  it('replaces the hint with the error, so only one message shows at a time', () => {
    render(
      <NumberField
        label="Margin"
        value="300"
        onChange={() => {}}
        hint="Used for break-even."
        error="Enter a percentage between 0 and 100."
      />,
    )

    expect(screen.getByText('Enter a percentage between 0 and 100.')).toBeInTheDocument()
    expect(screen.queryByText('Used for break-even.')).not.toBeInTheDocument()
    // Screen readers need to know too, not just sighted users.
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true')
  })

  it('reports every keystroke to the parent', async () => {
    const onChange = vi.fn()
    render(<NumberField label="Budget" value="" onChange={onChange} />)

    await userEvent.type(screen.getByRole('spinbutton'), '50')

    // The field is controlled and `value` never changes here, so each keystroke
    // is reported on its own rather than accumulating.
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith('0')
  })
})
