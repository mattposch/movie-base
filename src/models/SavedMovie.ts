import mongoose from 'mongoose';

export type SavedMovieDocument = mongoose.Document & {
    id: string;
    list: string;
};

const savedMovieSchema = new mongoose.Schema<SavedMovieDocument>(
    {
        id: String,
        list: String,
    },
    { timestamps: true },
);

export const SavedMovie = mongoose.model<SavedMovieDocument>('SavedMovie', savedMovieSchema);
