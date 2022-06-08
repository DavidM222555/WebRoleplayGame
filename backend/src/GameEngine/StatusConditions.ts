export interface IStatusCondition {
    name: string;
    bgColor: string;
}

export const Poisoned: IStatusCondition = {
    name: "Poisoned",
    bgColor: "lightgreen",
}