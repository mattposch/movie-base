import { Request, Response, NextFunction } from 'express';
import { NativeError } from 'mongoose';
import axios from 'axios';

import { SavedMovie, SavedMovieDocument } from '../models/SavedMovie';

export const THEMOVIEDB_APIKEY = process.env['THEMOVIEDB_APIKEY'];

export type MovieDto = {
    id: string,
    posterPath: string,
    genres: {id: number, name: string},
    imdbId: string,
    releaseDate: string,
    runtime: number,
    title: string,
    voteAverage: number,
    voteCount: number,
    seen?: boolean,
    watchlist?: boolean,
};

export const search = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.query as string) ?? undefined;
    const type = (req.query.type as string) ?? undefined;
    const savedList = (req.query.list as 'seen' | 'watchlist') ?? undefined;
    
    let resultSet;
    if (!savedList) {
        const result = await axios.get(`https://api.themoviedb.org/3/search/${type}?api_key=${THEMOVIEDB_APIKEY}&query=${query}`);
        resultSet = await getMovieDetails(result.data.results);
    } else {
        resultSet = await getFilteredMovies(savedList);
    }

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

const getMovieDetails = async (items: any) => {
    const resultSet = [];

    for (const item of items) {
        const detailResult = await axios.get(`https://api.themoviedb.org/3/movie/${item.id}?api_key=${THEMOVIEDB_APIKEY}`);
        
        const cleanResult: MovieDto = {
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
        
        const savedResult = await SavedMovie.findOne({id: detailResult.data.id});
        if (savedResult) {
            cleanResult.seen = savedResult.seen;
            cleanResult.watchlist = savedResult.watchlist;
        }

        resultSet.push(cleanResult);
    }

    return resultSet;
};

const getFilteredMovies = async (savedList: 'seen' | 'watchlist') => {
    let savedMovies;
    if (savedList === 'seen') {
        savedMovies = await SavedMovie.find({seen: true});
    } else if (savedList === 'watchlist') {
        savedMovies = await SavedMovie.find({watchlist: true});
    }

    const result = await getMovieDetails(savedMovies);   
    return result; 
}