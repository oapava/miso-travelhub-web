import { render, screen } from '@testing-library/react';
import DataTable from '@/components/shared/DataTable/DataTable';

interface User {
  id: number;
  name: string;
  email: string;
}

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
];

const data: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data row values', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('renders a row for each data item', () => {
    render(<DataTable columns={columns} data={data} dataTestId="table" />);
    expect(screen.getByTestId('table-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
  });

  it('renders table with role="table"', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders column header cells with scope="col"', () => {
    render(<DataTable columns={columns} data={data} />);
    const headerCells = document.querySelectorAll('th[scope="col"]');
    expect(headerCells).toHaveLength(3);
  });

  it('renders default empty message when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty message when data is empty', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No records found" />);
    expect(screen.getByText('No records found')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<DataTable columns={columns} data={data} title="User List" />);
    expect(screen.getByText('User List')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(document.querySelector('.data-table__title')).not.toBeInTheDocument();
  });

  it('uses custom render function for cell content', () => {
    const columnsWithRender = [
      ...columns,
      {
        key: 'actions',
        header: 'Actions',
        render: (_item: User) => <button>Edit</button>,
      },
    ];
    render(<DataTable columns={columnsWithRender} data={data} />);
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
  });

  it('sets data-testid attribute on container', () => {
    render(<DataTable columns={columns} data={data} dataTestId="my-table" />);
    expect(screen.getByTestId('my-table')).toBeInTheDocument();
  });

  it('merges custom className on container', () => {
    render(<DataTable columns={columns} data={data} className="custom-table" dataTestId="tbl" />);
    expect(screen.getByTestId('tbl')).toHaveClass('custom-table');
  });

  it('renders empty row spanning all columns when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />);
    const emptyCell = document.querySelector('.data-table__cell--empty');
    expect(emptyCell).toHaveAttribute('colSpan', '3');
  });
});
