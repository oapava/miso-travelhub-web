import { render, screen, fireEvent } from '@testing-library/react';
import Select from '@/components/ui/Select/Select';

const options = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
];

describe('Select', () => {
  it('renders a select element', () => {
    render(<Select options={options} dataTestId="sel" />);
    expect(screen.getByTestId('sel')).toBeInTheDocument();
  });

  it('renders all provided options', () => {
    render(<Select options={options} />);
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Spanish' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'French' })).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Select options={options} label="Language" />);
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('associates label with select via htmlFor/id', () => {
    render(<Select options={options} label="Language" />);
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
  });

  it('renders placeholder option when provided', () => {
    render(<Select options={options} placeholder="Choose language" />);
    expect(screen.getByRole('option', { name: 'Choose language' })).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    render(<Select options={options} error="Selection required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Selection required');
  });

  it('marks select as aria-invalid when error is provided', () => {
    render(<Select options={options} error="Required" dataTestId="sel" />);
    expect(screen.getByTestId('sel')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not mark select as aria-invalid without error', () => {
    render(<Select options={options} dataTestId="sel" />);
    expect(screen.getByTestId('sel')).toHaveAttribute('aria-invalid', 'false');
  });

  it('applies full-width class when fullWidth is true', () => {
    const { container } = render(<Select options={options} fullWidth />);
    expect(container.firstChild).toHaveClass('select-field--full-width');
  });

  it('applies error class when error is provided', () => {
    const { container } = render(<Select options={options} error="Error" />);
    expect(container.firstChild).toHaveClass('select-field--error');
  });

  it('calls onChange when selection changes', () => {
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} dataTestId="sel" />);
    fireEvent.change(screen.getByTestId('sel'), { target: { value: 'es' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('sets data-testid attribute on select element', () => {
    render(<Select options={options} dataTestId="my-select" />);
    expect(screen.getByTestId('my-select')).toBeInTheDocument();
  });

  it('does not render label element when label is not provided', () => {
    render(<Select options={options} />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });
});
