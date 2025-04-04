import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import validationSchema from './validationSchema';
import TextField from '@mui/material/TextField';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ProductModal({ open, setOpen, editProductId }) {
    const [editing, setEditing] = useState(false);
    const [initialValues, setInitialValues] = useState({
        name: '',
        category: '',
        quantity: '',
        price: '',
        description: '',
    });

    useEffect(() => {
        if (editProductId) {
            async function fetchProduct() {
                try {
                    const response = await fetch(`http://localhost:5000/api/products/${editProductId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setInitialValues(data);
                    setOpen(true);
                    setEditing(true);
                } catch (error) {
                    console.error('Error fetching product for edit:', error.message);
                }
            }
            fetchProduct();
        }
    }, [editProductId]);

    const handleClose = () => setOpen(false);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const url = editing
                ? `http://localhost:5000/api/products/${editProductId}`
                : 'http://localhost:5000/api/products';
            const method = editing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                alert(`Product ${editing ? 'updated' : 'added'} successfully`);
                window.location.reload();
                setOpen(false);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error('Fetch error:', error.message);
            alert('Network error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 500 } }}
        >
            <Fade in={open}>
                <Box sx={style}>
                    <Typography id="transition-modal-title" variant="h6" component="h2">
                        {editing ? 'Edit Product' : 'Add New Product'}
                    </Typography>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <Field
                                    as={TextField}
                                    label="Name"
                                    name="name"
                                    fullWidth
                                    required
                                    margin="normal"
                                />
                                <ErrorMessage name="name" component="p" style={{ color: 'red' }} />

                                <Field
                                    as={TextField}
                                    label="Category"
                                    name="category"
                                    fullWidth
                                    required
                                    margin="normal"
                                />
                                <ErrorMessage name="category" component="p" style={{ color: 'red' }} />

                                <Field
                                    as={TextField}
                                    label="Quantity"
                                    name="quantity"
                                    type="number"
                                    fullWidth
                                    required
                                    margin="normal"
                                />
                                <ErrorMessage name="quantity" component="p" style={{ color: 'red' }} />

                                <Field
                                    as={TextField}
                                    label="Price"
                                    name="price"
                                    type="number"
                                    fullWidth
                                    required
                                    margin="normal"
                                />
                                <ErrorMessage name="price" component="p" style={{ color: 'red' }} />

                                <Field
                                    as={TextField}
                                    label="Description"
                                    name="description"
                                    fullWidth
                                    margin="normal"
                                />
                                <ErrorMessage name="description" component="p" style={{ color: 'red' }} />

                                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Fade>
        </Modal>
    );
}
