import { Request, Response, NextFunction } from 'express';
import { NativeError } from 'mongoose';
import axios from 'axios';

import { SavedMovie, SavedMovieDocument } from '../models/SavedMovie';

export const THEMOVIEDB_APIKEY = process.env['THEMOVIEDB_APIKEY'];

export const search = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.query as string) ?? undefined;
    const type = (req.query.type as string) ?? undefined;
    const result = await axios.get(`https://api.themoviedb.org/3/search/${type}?api_key=${THEMOVIEDB_APIKEY}&query=${query}`);

    const resultSet = await getMovieDetails(result.data.results);

    res.send(resultSet);
};

export const saveMovieToList = async (req: Request, res: Response): Promise<void> => {
    const data = {
        seen: req.body.seen,
        watchlist: req.body.watchlist
    };

    const movie = await SavedMovie.findOneAndUpdate({id: req.body.id}, data, {
        new: true,
        upsert: true
    });

    res.send(movie);
};

export const fetchMovieList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const list = (req.query.list as string) ?? undefined;
    SavedMovie.find({ list }, async (err: NativeError, result: SavedMovieDocument[]) => {
        if (err) { return next(err); }

        const resultSet = await getMovieDetails(result);

        res.send(resultSet);
    });
};

const getMovieDetails = async (items) => {
    const resultSet = [];

    for (const item of items) {
        const detailResult = await axios.get(`https://api.themoviedb.org/3/movie/${item.id}?api_key=${THEMOVIEDB_APIKEY}`);

        const cleanResult = {
            id: detailResult.data.id,
            posterPath: 'https://image.tmdb.org/t/p/original' + detailResult.data.poster_path,
            genres: detailResult.data.genres,
            imdbId: detailResult.data.imdb_id,
            releaseDate: detailResult.data.release_date,
            runtime: detailResult.data.runtime,
            title: detailResult.data.title,
            voteAverage: detailResult.data.vote_average,
            voteCount: detailResult.data.vote_count
        };
        resultSet.push(cleanResult);
    }

    return resultSet;
};