import { Request, Response, NextFunction } from 'express';
import { NativeError } from 'mongoose';
import axios from 'axios';

import { SavedMovie, SavedMovieDocument } from '../models/SavedMovie';

export const THEMOVIEDB_APIKEY = process.env['THEMOVIEDB_APIKEY'];

export const search = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.query as string) ?? undefined;
    const type = (req.query.type as string) ?? undefined;
    const result = await axios.get(`https://api.themoviedb.org/3/search/${type}?api_key=${THEMOVIEDB_APIKEY}&query=${query}`);
    res.send(result.data);
};

export const saveMovieToList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const savedMovie = new SavedMovie({
        id: req.body.id,
        list: req.body.list
    });

    savedMovie.save((err) => {
        if (err) { return next(err); }
        res.send(savedMovie);
    });
};

export const fetchMovieList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const list = (req.query.list as string) ?? undefined;
    SavedMovie.find({ list }, async (err: NativeError, result: SavedMovieDocument[]) => {
        if (err) { return next(err); }

        const resultSet = [];

        for (const item of result) {
            const detailResult = await axios.get(`https://api.themoviedb.org/3/movie/${item.id}?api_key=${THEMOVIEDB_APIKEY}`);
            resultSet.push(detailResult.data);
        }

        res.send(resultSet);
    });
};