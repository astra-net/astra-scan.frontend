import { Text } from "grommet";
import React from "react";
import { useASTRAExchangeRate } from "src/hooks/useASTRAExchangeRate";

export const FiatPrice = () => {
  const { lastPrice, priceChangePercent } = useASTRAExchangeRate();

  if (!lastPrice) {
    return <Text size="xsmall">&nbsp;</Text>;
  }

  const price = parseFloat(lastPrice).toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    currency: "USD",
  });
  const change = (+priceChangePercent).toFixed(2);
  const isPositive = +priceChangePercent >= 0;

  return (
    <>
      <Text size="xsmall">ASTRA:&nbsp;${price}&nbsp;</Text>
      <Text size="xsmall" color={isPositive ? "#69FABD" : "status-error"}>
        ({isPositive && "+"}
        {change}%)
      </Text>
    </>
  );
};
