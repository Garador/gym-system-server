import {TableNames} from '../enums/Database';

export const BaseCurrency = [{
       [TableNames.Currency.id]: "VES",
       [TableNames.Currency.display_name]: "VES",
       [TableNames.Currency.decimals]: 2,
       [TableNames.Currency.iso_4217]: 928,
       [TableNames.Currency.status]: 1
},{
    [TableNames.Currency.id]: "USD",
    [TableNames.Currency.display_name]: "USD",
    [TableNames.Currency.decimals]: 2,
    [TableNames.Currency.iso_4217]: 840,
    [TableNames.Currency.status]: 0
}];