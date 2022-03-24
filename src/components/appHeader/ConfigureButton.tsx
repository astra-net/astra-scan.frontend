import { Box, DropButton, Text } from "grommet";
import { Menu } from "grommet-icons";
import React from "react";
import { currencyType, useCurrency } from "src/hooks/ASTRA-ETH-SwitcherHook";
import {
	DateFormat,
	setDateFormatMode,
	useDateFormatMode
} from "src/hooks/dateFormatSwitcherHook";
import {
	setThemeMode,
	themeType,
	useThemeMode
} from "src/hooks/themeSwitcherHook";
import styled from "styled-components";

export function ConfigureButton() {
	const theme = useThemeMode();
	const currency = useCurrency();
	const dateFormat = useDateFormatMode();

	return (
		<DropButton
			label={<Menu size="medium" color={"#fff"} />}
			dropAlign={{ top: "bottom", right: "right" }}
			style={{
				height: "32px",
				border: "none",
				boxShadow: "none",
				paddingRight: "6px",
				paddingLeft: 0,
			}}
			dropProps={{ round: "4px" }}
			dropContent={
				<Box
					pad="medium"
					background="background"
					border={{ size: "xsmall", color: "border" }}
					style={{ borderRadius: "0px" }}
				>
					<Text size="small" weight="bold" margin={{ bottom: "xsmall" }}>
						Theme
					</Text>
					<ToggleButton
						value={theme}
						options={[
							{ text: "Light", value: "light" },
							{ text: "Dark", value: "dark" },
						]}
						onChange={setThemeMode}
					/>
					{/*<Text*/}
					{/*  size="small"*/}
					{/*  weight="bold"*/}
					{/*  margin={{ bottom: "xsmall", top: "small" }}*/}
					{/*>*/}
					{/*  Address style*/}
					{/*</Text>*/}
					{/*<ToggleButton*/}
					{/*  value={currency}*/}
					{/*  options={[*/}
					{/*    { text: "Astra", value: "ASTRA" },*/}
					{/*    { text: "ETH", value: "ETH" },*/}
					{/*  ]}*/}
					{/*  onChange={setCurrency}*/}
					{/*/>*/}
					<Text
						size="small"
						weight="bold"
						margin={{ bottom: "xsmall", top: "small" }}
					>
						Date Format
					</Text>
					<ToggleButton
						value={dateFormat}
						options={[
							{ text: "Exact", value: DateFormat.EXACT },
							{ text: "Relative", value: DateFormat.RELATIVE },
						]}
						onChange={setDateFormatMode}
					/>
				</Box>
			}
		/>
	);
}

interface ToggleProps {
	value: string;
	options: Array<{
		text: string;
		value: themeType | currencyType | DateFormat;
	}>;
	onChange: (value: any) => void;
}

//@ts-ignore
const ToggleButton = (props: ToggleProps) => {
	const { options, value, onChange } = props;

	return (
		<Box
			direction="row"
			background="transparent"
			border={{ size: "xsmall", color: "border" }}
			style={{ overflow: "hidden", borderRadius: "8px" }}
		>
			{options.map((i) => (
				<SwitchButton
					selected={i.value === value}
					onClick={() => onChange(i.value)}
					key={i.value}
				>
					{i.text}
				</SwitchButton>
			))}
		</Box>
	);
};

const SwitchButton = styled.div<{ selected: boolean }>`
	padding: 8px 20px;
	min-width: 60px;
	background-color: ${(props) =>
		props.selected ? props.theme.global.colors.brand : "transparent"};
	color: ${(props) =>
		props.selected
			? props.theme.global.colors.background
			: props.theme.global.colors.brand};
	font-weight: ${(props) => (props.selected ? "bold" : "normal")};
	user-select: none;
	outline: none;
	text-align: center;
	cursor: ${(props) => (props.selected ? "auto" : "pointer")};
`;
