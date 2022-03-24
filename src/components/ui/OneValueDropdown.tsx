import dayjs from "dayjs";
import { Box, Text } from "grommet";
import { StatusGood } from "grommet-icons";
import React from "react";
import { getNearestPriceForTimestamp } from "src/components/ASTRA_USDT_Rate";
import { useThemeMode } from "src/hooks/themeSwitcherHook";
import { useASTRAExchangeRate } from "src/hooks/useASTRAExchangeRate";
import styled from "styled-components";
import { toaster } from "../../App";
import { Dropdown } from "../dropdown/Dropdown";
import { CopyBtn } from "./CopyBtn";

const Icon = styled(StatusGood)`
  margin-right: 5px;
`;

interface ASTRAValueProps {
    value: (string | number)[];
    timestamp?: string;
    hideTip?: boolean;
}

// @ts-ignore
export const ASTRAValueDropdown = (props: ASTRAValueProps) => {
    const {value, timestamp = "", hideTip = false} = props;
    const {lastPrice} = useASTRAExchangeRate();
    const themeMode = useThemeMode();

    if (!value.length) {
        return null;
    }

    const isTodayTransaction =
        dayjs(timestamp).format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
    const price =
        timestamp && !isTodayTransaction
            ? getNearestPriceForTimestamp(timestamp)
            : lastPrice;

    const normalizedValue: {
        value: string | number;
        one: number;
        usd: string | number;
        index: number;
        key: string;
    }[] = value.map((hashValue, index) => {
        const bi = BigInt(hashValue) / BigInt(10 ** 14);
        const v = parseInt(bi.toString()) / 10000;
        let USDValue = 0;
        if (price && v > 0) {
            USDValue = v * +price;
        }

        return {value: hashValue, one: v, usd: USDValue || 0, index, key: `${hashValue}_${index}`};
    });

    const hideCopyBtn = false

    let valueCopy = ''

    try {
        valueCopy = normalizedValue[0].one.toString()
    } catch (e) {
    }

    return (
        <Dropdown
            items={normalizedValue}
            keyField={"key"}
            themeMode={themeMode}
            itemHeight={"30px"}
            itemStyles={{justifyContent: "center"}}
            renderValue={() => (
                <Box direction={"row"} align={"center"} style={{paddingTop: "2px"}}>
                    {hideCopyBtn ? null : (
                        <CopyBtn
                            value={valueCopy}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toaster.show({
                                    message: () => (
                                        <Box direction={"row"} align={"center"} pad={"small"}>
                                            {<Icon size={"small"} color={"headerText"}/>}
                                            <Text size={"small"}>Copied to clipboard</Text>
                                        </Box>
                                    )
                                });
                            }}
                        />
                    )}
                    <div style={{marginRight: '5px'}}></div>

                    <Text size={"small"}>
                        <b>
                            {normalizedValue.reduce((prev, cur) => {
                                prev += cur.one;
                                return prev;
                            }, 0)}{" "}
                            ASTRA
                        </b>
                    </Text>
                    <Text size={"small"} style={{paddingLeft: "4px"}}>
                        ($
                        {normalizedValue
                            .reduce((prev, cur) => {
                                prev += +cur.usd;
                                return prev;
                            }, 0)
                            .toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                currency: "USD"
                            })}
                        )
                    </Text>
                </Box>
            )}
            renderItem={(item) => (
                <Box direction={"row"}>
                    <Text size={"small"} style={{width: "52.5px"}}>
                        Shard {item.index}:{" "}
                    </Text>
                    <Text size={"small"} style={{paddingLeft: "4px"}}>
                        <b>{item.one} ASTRA </b>
                    </Text>
                    {item.usd ? (
                        <Text size={"small"} style={{paddingLeft: "4px"}}>
                            ($
                            {item.usd.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                currency: "USD"
                            })}
                            )
                        </Text>
                    ) : null}
                </Box>
            )}
        />
    );
};
