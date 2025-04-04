import * as Yup from 'yup';

const validationSchema = Yup.object({
    name: Yup.string()
        .matches(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces') // Restricts special characters
        .min(3, 'Name must be at least 3 characters')
        .required('Name is required'),
    category: Yup.string().required('Category is required'),
    quantity: Yup.number()
        .typeError('Quantity must be a number')
        .integer('Quantity must be a whole number')
        .min(1, 'Quantity must be at least 1')
        .required('Quantity is required'),
    price: Yup.number()
        .typeError('Price must be a number')
        .positive('Price must be a positive number')
        .required('Price is required'),
    description: Yup.string(),
});

export default validationSchema;

