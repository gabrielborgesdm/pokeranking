import { NextApiResponse } from "next";
import {
  BEING_USED,
  ERROR,
  POKEMON_ALREADY_REGISTERED,
  POKEMON_NOT_FOUND,
  SUCCESS,
} from "../../../../configs/APIConfig";
import { IRequest } from "../../../../configs/types/IRequest";
import { removeImage, writeImage } from "../helpers/ImageHelpers";
import { abstractPokemon } from "../helpers/PokemonHelpers";
import { sendResponse } from "../helpers/ResponseHelpers";
import PokemonRepository from "../repositories/PokemonRepository";
import UserRepository from "../repositories/UserRepository";

const pokemonRepository = new PokemonRepository();
const userRepository = new UserRepository();

export const getAllPokemons = async (req: IRequest, res: NextApiResponse) => {
  const pokemons = await pokemonRepository.getAll();
  const formattedPokemons = pokemons.map((pokemon) =>
    abstractPokemon(req, pokemon)
  );
  return sendResponse(req, res, SUCCESS, { pokemons: formattedPokemons });
};

export const getPokemon = async (req: IRequest, res: NextApiResponse) => {
  const { slug }: any = req.query;
  const pokemonId = parseInt(slug);
  const pokemon = await pokemonRepository.getById(pokemonId);
  if (!pokemon) return sendResponse(req, res, POKEMON_NOT_FOUND);
  return sendResponse(req, res, SUCCESS, {
    pokemon: abstractPokemon(req, pokemon),
  });
};

export const storePokemon = async (req: IRequest, res: NextApiResponse) => {
  const { pokemon: pokemonInfo } = req.body;
  if (await pokemonRepository.get({ name: pokemonInfo.name }))
    return sendResponse(req, res, POKEMON_ALREADY_REGISTERED);
  const imageURL = await writeImage(pokemonInfo.image);
  if (!imageURL) return sendResponse(req, res, ERROR);
  pokemonInfo.image = imageURL;
  const pokemon = await pokemonRepository.store(pokemonInfo);
  if (!pokemon) {
    removeImage(imageURL);
    return sendResponse(req, res, ERROR);
  }
  return sendResponse(req, res, SUCCESS, {
    pokemon: abstractPokemon(req, pokemon),
  });
};

export const updatePokemon = async (req: IRequest, res: NextApiResponse) => {
  const { slug }: any = req.query;
  const { pokemon: pokemonInfo } = req.body;
  const pokemonId = parseInt(slug);

  const pokemonFound = await pokemonRepository.getById(pokemonId);
  if (!pokemonFound) return sendResponse(req, res, POKEMON_NOT_FOUND);

  if (
    pokemonInfo.name &&
    (await pokemonRepository.get({ name: pokemonInfo.name }))
  ) {
    return sendResponse(req, res, POKEMON_ALREADY_REGISTERED);
  }

  if (pokemonInfo.image) {
    removeImage(pokemonFound.image);
    const imageUrl = await writeImage(pokemonInfo.image);
    if (imageUrl) {
      pokemonInfo.image = imageUrl;
    } else {
      return sendResponse(req, res, ERROR);
    }
  }

  const pokemon = await pokemonRepository.update(pokemonId, pokemonInfo);
  if (!pokemon) {
    removeImage(pokemonFound.image);
    return sendResponse(req, res, ERROR);
  }
  return sendResponse(req, res, SUCCESS, {
    pokemon: abstractPokemon(req, pokemon),
  });
};

export const deletePokemon = async (req: IRequest, res: NextApiResponse) => {
  const { slug }: any = req.query;
  const pokemonId = parseInt(slug);
  const pokemonFound = await pokemonRepository.getById(pokemonId);
  if (!pokemonFound) return sendResponse(req, res, POKEMON_NOT_FOUND);
  if (
    await userRepository.get({
      pokemons: { $elemMatch: { pokemon: pokemonId } },
    })
  ) {
    return sendResponse(req, res, BEING_USED);
  }
  const pokemon = await pokemonRepository.delete(pokemonId);
  if (!pokemon) {
    return sendResponse(req, res, ERROR);
  }
  removeImage(pokemonFound.image);
  return sendResponse(req, res, SUCCESS, {
    pokemon: abstractPokemon(req, pokemon),
  });
};
