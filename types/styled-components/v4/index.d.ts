// Type definitions for styled-components 4.0
// Project: https://github.com/styled-components/styled-components
// Definitions by: Igor Oleinikov <https://github.com/Igorbek>
//                 Ihor Chulinda <https://github.com/Igmat>
//                 Simon Buchan <https://github.com/simonbuchan>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

import * as React from 'react';

// v3 names, remove in v5
/** @deprecated use StyledProps */
export type ThemedStyledProps<Props, Theme> = StyledProps<Props, Theme>;
/** @deprecated use OuterStyledProps */
export type ThemedOuterStyledProps<Props, Theme> = OuterStyledProps<Props, Theme>;
/** @deprecated Use InterpolationValue<P> */
export type FlattenInterpolation<Props> = InterpolationValue<Props>;
/** @deprecated Use InterpolationValue */
export type SimpleInterpolation = InterpolationValue;
/** @deprecated use StyledFunction */
export type ThemedStyledFunction<Props, Theme, OuterProps = Props> =
    StyledFunction<Props, Theme, OuterProps>;
/** @deprecated Use Styled<Theme> */
export type ThemedBaseStyledInterface<Theme> = Styled<Theme>;
/** @deprecated Use Styled<Theme> */
export type ThemedStyledInterface<Theme> = Styled<Theme>;
/** @deprecated Use Styled */
export type StyledInterface = Styled;
/** @deprecated Use Css<Theme> */
export type ThemedCssFunction<Theme> = Css<Theme>;
/** @deprecated Use WithTheme<Theme> */
export type WithThemeFnInterface<Theme> = WithTheme<Theme>;


// Helper type operators:

// The type "T - U", that is, "every element of T that is
// not an element of U". For example:
// ```
// Diff<'a' | 'b' | 'c', 'b' | 'd'> = 'a' | 'c'
// ```
type Diff<T extends keyof any, U extends keyof any> =
    ({ [P in T]: P } & { [P in U]: never })[T];

// Remove a set of properties from T. For example:
// ```
// Omit<{ a: string, b: number }, 'b' | 'c'> = { a: string }
// ```
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

// Return every property of T and U that is not in both. For example:
// ```
// DiffBetween<{ a: string, b: number }, { b: boolean, c: symbol }> =
//   { a: string, c: symbol }
// ```
type DiffBetween<T, U> =
    & Pick<T, Diff<keyof T, keyof U>>
    & Pick<U, Diff<keyof U, keyof T>>;


// An extension point for adding properties to the default theme
// used by the standard exports (`styled`, `css`, etc.)
// Use this pattern to add properties in your code:
// ```
// declare module "styled-components" {
//     interface DefaultTheme {
//         // Your properties here:
//         primary: string;
//     }
// }
// ```
export interface DefaultTheme {}

// Default export.
// Provides styled component functions (StyledFunction<> below)
// as props for each of the standard HTML elements, or when
// called with a react type (either a DOM element type or a
// component type)
// This function, designed to be called as a ECMAScript tagged string
// template, will then return the styled component wrapping the
// original react type, adding the requested styles (or arbitrary other
// props with .attr())
// ```
// import styled from 'styled-components'
// const RedDiv = styled.div` color: red `;
// const BoldRedDiv = styled(RedDiv)` font-weight: bold `;
// const greeting = <BoldRedDiv>Hello!</BoldRedDiv>;
// ```
declare const styled: Styled;
export default styled;
export type Styled<Theme = DefaultTheme> =
  & StyledIntrinsicsMap<Theme>
  & StyledIntrinsicFunction<Theme>
  & StyledComponentFunction<Theme>;

// styled.div`...`
type StyledIntrinsicsMap<Theme> = {
    [Tag in keyof JSX.IntrinsicElements]:
        StyledFunction<JSX.IntrinsicElements[Tag], Theme>
};

// styled('div')`...`
interface StyledIntrinsicFunction<Theme> {
    <Props, Tag extends keyof JSX.IntrinsicElements>(
        tag: Tag,
    ): StyledFunction<Props, Theme, Props & JSX.IntrinsicElements[Tag]>;
}

// styled(MyButton)`...`
interface StyledComponentFunction<Theme> {
    <Props>(
        type: React.ComponentType<Props>,
    ): StyledFunction<Props, Theme, WithOptionalTheme<Props, Theme>>;
}

// The styled component function that, when called, will create the styled component.
export interface StyledFunction<Props, Theme = any, OuterProps = Props> {
    // styled.div`...` or styled(MyButton)`...`
    (
        strings: TemplateStringsArray,
        ...interpolations: StyledInterpolationArray<Props, Theme>
    ): StyledComponentClass<Props, Theme, OuterProps>;

    // styled.div<MyProps>`... ${p => ...}` or
    // styled(MyButton)`... ${(p: MyProps) => ...}`
    <StyleFunctionProps>(
        strings: TemplateStringsArray,
        ...interpolations: StyledInterpolationArray<Props & StyleFunctionProps, Theme>
    ): StyledComponentClass<
        Props & StyleFunctionProps,
        Theme,
        OuterProps & StyleFunctionProps
    >;

    // styled.x.attrs(p => ...)`...` or
    // styled.x.attrs<P>(p => ...)`...`
    attrs<
        StyleFunctionProps,
        AttrProps extends Partial<Props & StyleFunctionProps> = {}
    >(
        attrs: Attrs<Props & StyleFunctionProps, AttrProps, Theme>,
    ): StyledFunction<
        DiffBetween<AttrProps, Props & StyleFunctionProps>,
        Theme,
        DiffBetween<AttrProps, OuterProps & StyleFunctionProps>
    >;
}


// Result type of StyledFunction<> (e.g. the type of styled components)
export interface StyledComponentClass<Props, Theme, OuterProps = Props>
    extends React.ComponentClass<OuterStyledProps<OuterProps, Theme>> {
    // Note that this should be using React.ComponentType<>, as v4 uses
    // forwardRef() and that is the type returned in the react typings,
    // but for some reason TypeScript refuses to then infer StyleFunctionProps
    // in StyledFunction<> above, apparantly as it is returning a generic
    // function type.

    // const MyLabel = MyDiv.withComponent('label')
    // Prefer using `<MyDiv as="label" />` if possible
    withComponent<Tag extends keyof JSX.IntrinsicElements>(
        tag: Tag,
    ): StyledComponentClass<
        JSX.IntrinsicElements[Tag],
        Theme,
        JSX.IntrinsicElements[Tag] & OuterProps
    >;

    // const MyButton = MyDiv.withComponent(MyButton)
    // Prefer using `<MyDiv as={MyButton} />` if possible
    withComponent<InnerProps>(
        element: React.ComponentType<InnerProps>,
    ): StyledComponentClass<InnerProps, Theme, InnerProps & OuterProps>;
}

// Allows sharing CSS between components, even when it uses interpolations:
// ```
// import { css } from 'styled-components';
// const buttonStyles = css<ButtonProps>`
//   background: ${props => props.active ? 'green' : 'red'}
// `;
// const MyButton = styled.button`border: 0; ${buttonStyles}`;
// const ItemButton = styled.li`list-style: none; ${buttonStyles}`;
// ```
export const css: Css;
export interface Css<Theme = DefaultTheme> {
    <InterpolationProps>(
        strings: TemplateStringsArray,
        ...interpolations:
            StyledInterpolationArray<InterpolationProps, Theme>
    ): StyledInterpolationArray<InterpolationProps, Theme>;
}


export const ThemeProvider: ThemeProviderComponent<object>;
export type ThemeProviderComponent<Theme> =
    React.ComponentClass<ThemeProviderProps<Theme>>;
export interface ThemeProviderProps<T> {
    theme?: T | ((theme: T) => T);
}


export const ThemeConsumer: ThemeConsumerComponent<object>;
export type ThemeConsumerComponent<Theme> =
    React.ComponentClass<ThemeConsumerProps<Theme>>;
export interface ThemeConsumerProps<T> {
    children(theme: T): React.ReactNode;
}

// Internal shorthand for common type for interpolations of StyledFunction<> and Css<>
type StyledInterpolationArray<Props, Theme> =
    Array<Interpolation<StyledProps<Props, RelaxEmptyTheme<Theme>>>>;

// Type of `attrs()` args
type Attrs<Props, AttrProps extends Partial<Props>, Theme> = {
    [K in keyof AttrProps]: ((props: StyledProps<Props, Theme>) => AttrProps[K]) | AttrProps[K]
};


// Common props provided by the styled component theming
export interface ThemeProps<Theme> { theme: Theme; }

// Props available within a style interpolation function or provided to
// a wrapped component.
export type StyledProps<Props, Theme = any> = Props & ThemeProps<Theme>;

// Props available to be passed to a component (e.g. `this.props`)
export type OuterStyledProps<Props, Theme = any> = Props & Partial<ThemeProps<Theme>>;

// The type of the expressions within style interpolation
// sections, that is, the x in styled.div` ${x} `
// They allow arbitrary array recursion.
export type Interpolation<Props> =
    | InterpolationValue<Props>
    | InterpolationArrayRecursion<Props>;
export interface InterpolationArrayRecursion<Props>
    extends ReadonlyArray<Interpolation<Props>> {}

// The actual values to be rendered into the style. Can
// be raw CSS text or as an object, or generated from a callback
export type InterpolationValue<Props = never> =
    | FalseyValue
    | string
    | number
    | Styles
    | InterpolationFunction<Props>
    | StyledComponentClass<any, any>;

// Using CSS as an object, for example:
// ```
// styled.div`${{ color: 'red' }}`
// ```
// is equivalent to:
// ```
// styled.div`color: red`
// ```
export interface Styles {
    [ruleOrSelector: string]: string | number | Styles;
}

// Accepted and ignored values that allow using conditional
// styles with the idiom: `condition && value`
export type FalseyValue = undefined | null | false;

// Interpolation props can also be functions which receive
// the props passed to the rendered element
export interface InterpolationFunction<Props> {
    (props: Props): Interpolation<Props>;
}

// Replaces empty themes, such as an unmodified DefaultTheme, with `any`
// so that by default the `theme` property has type `any` in styled callbacks
type RelaxEmptyTheme<Theme> =
    Extract<keyof Theme, string> extends never ? any : Theme;

type WithOptionalTheme<Props extends { theme?: Theme }, Theme> =
    & Omit<Props, 'theme'>
    & { theme?: Theme; };

export interface WithTheme<Theme = DefaultTheme> {
    <Props extends { theme?: RelaxEmptyTheme<Theme> }>(
        component: React.ComponentType<Props>,
    ): React.ComponentClass<WithOptionalTheme<Props, Theme>>;
}
export const withTheme: WithTheme;

export interface Keyframes {
    getName(): string;
}

export function keyframes(
    strings: TemplateStringsArray,
    ...interpolations: SimpleInterpolation[]
): Keyframes;

export function createGlobalStyle(
    strings: TemplateStringsArray,
    ...interpolations: SimpleInterpolation[]
): React.ReactType;

export function isStyledComponent(
    target: any,
): target is StyledComponentClass<{}, {}>;

interface StylesheetComponentProps {
    sheet: ServerStyleSheet;
}

interface StyleSheetManagerProps {
    sheet?: StyleSheet;
    target?: Node;
}

export class StyleSheetManager
    extends React.Component<StyleSheetManagerProps> {}

export class ServerStyleSheet {
    collectStyles(
        tree: React.ReactNode,
    ): React.ReactElement<StylesheetComponentProps>;

    getStyleTags(): string;
    getStyleElement(): Array<React.ReactElement<{}>>;
    interleaveWithNodeStream(
        readableStream: NodeJS.ReadableStream,
    ): NodeJS.ReadableStream;
    instance: StyleSheet;
}

export interface ThemedStyledComponentsModule<Theme> {
    default: Styled<Theme>;

    css: Css<Theme>;
    keyframes(
        strings: TemplateStringsArray,
        ...interpolations: SimpleInterpolation[]
    ): Keyframes;
    createGlobalStyle(
        strings: TemplateStringsArray,
        ...interpolations: SimpleInterpolation[]
    ): React.ReactType;
    withTheme: WithTheme<Theme>;

    ThemeProvider: ThemeProviderComponent<Theme>;
    ThemeConsumer: ThemeConsumerComponent<Theme>;
}
