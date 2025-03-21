'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { listings } from '@/services/api';
import { useApp } from '@/context/AppContext';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function CreateListingPage() {
    const router = useRouter();
    const { user, setError } = useApp();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        language: '',
        price: '',
        code: '',
        tags: []
    });
    const [newTag, setNewTag] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please login to create a listing');
            return;
        }

        try {
            setLoading(true);
            const response = await listings.create(formData);
            router.push(`/listings/${response.data.listingId}`);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Create New Listing
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Programming Language</InputLabel>
                        <Select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            required
                            label="Programming Language"
                        >
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                            <MenuItem value="java">Java</MenuItem>
                            <MenuItem value="cpp">C++</MenuItem>
                            <MenuItem value="solidity">Solidity</MenuItem>
                            <MenuItem value="cadence">Cadence</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Price (FLOW)"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                label="Add Tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                size="small"
                            />
                            <Button
                                startIcon={<AddIcon />}
                                onClick={handleAddTag}
                                disabled={!newTag}
                            >
                                Add
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {formData.tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => handleRemoveTag(tag)}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create Listing'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
} 