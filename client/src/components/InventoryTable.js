import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import * as Papa from 'papaparse';

const paginationModel = { page: 0, pageSize: 5 };

export default function InventoryTable({ rows, setEditProductId }) {
    const columns = [
        { field: '_id', headerName: 'ID', flex: 1 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'category', headerName: 'Category', flex: 1 },
        { field: 'quantity', headerName: 'Quantity', type: 'number', flex: 1 },
        { field: 'price', headerName: 'Price', type: 'number', flex: 1 },
        { field: 'description', headerName: 'Description', sortable: false, flex: 1 },
        {
            field: 'delete',
            headerName: 'Delete',
            flex: 0.5,
            renderCell: (params) => (
                <Button variant='contained' color='error' onClick={() => handleDelete(params.row._id)}>Delete</Button>
            ),
        },
        {
            field: 'edit',
            headerName: 'Edit',
            flex: 0.5,
            renderCell: (params) => (
                <Button variant='contained' color='primary' onClick={() => handleSetEditProductId(params.row._id)}>Edit</Button>
            ),
        }
    ];

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this product?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting product:', error.message);
        }
    };

    const handleSetEditProductId = (id) => {
        setEditProductId(id);
    };

    const handleDownloadCSV = () => {
        const csv = Papa.unparse(rows);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Paper sx={{ height: 400, width: '100%' }}>
            <Button
                variant="contained"
                color="secondary"
                style={{ margin: '10px' }}
                onClick={handleDownloadCSV}
            >
                Download CSV
            </Button>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                sx={{ border: 0 }}
            />
        </Paper>
    );
}
