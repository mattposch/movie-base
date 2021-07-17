import mongoose from 'mongoose';

export type SavedMovieDocument = mongoose.Document & {
    id: string;
    seen: boolean;
    watchlist: boolean;
};

const savedMovieSchema = new mongoose.Schema<SavedMovieDocument>(
    {
        id: String,
        seen: Boolean,
        watchlist: Boolean,
    },
    { timestamps: true },
);

export const SavedMovie = mongoose.model<SavedMovieDocument>('SavedMovie', savedMovieSchema);
