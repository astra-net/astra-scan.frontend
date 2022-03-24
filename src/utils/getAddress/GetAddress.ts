import {
	isAddress
} from "./validators";

export class AstraAddress {
	static isValidBasic(str: string) {
		const toTest = new AstraAddress(str);
		return toTest.raw === toTest.basic;
	}

	raw: string;
	basic: string;

	get basicHex() {
		return `0x${this.basic}`;
	}

	constructor(raw: string) {
		this.raw = raw;
		this.basic = this.getBasic(this.raw);
	}

	/**
	 * Check whether the address has an valid address format
	 *
	 * @param addr string, the address
	 */
	private getBasic(addr: string) {
		const basicBool = isAddress(addr);

		if (basicBool) {
			return addr.replace("0x", "").toLowerCase();
		}

		throw new Error(`"${addr}" is an invalid address format`);
	}
}

/**
 * Using this function to get Astra format address
 *
 * @param address
 */
export function getAddress(address: string) {
	try {
		return new AstraAddress(address);
	} catch (error) {
		throw error;
	}
}
