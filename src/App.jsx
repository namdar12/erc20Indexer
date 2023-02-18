import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Grid,
  Stack,
  Card,
  SlideFade,
} from "@chakra-ui/react";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //const provider = new ethers.providers.AlchemyProvider("mainnet", import.meta.env.VITE_API_KEY)

  async function connectwalletHandler() {
    setUserAddress("");
    setResults([]);
    setHasQueried(false);
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    setUserAddress(signerAddress);
  }

  async function getTokenBalance() {
    const config = {
      apiKey: import.meta.env.VITE_API_KEY,
      network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(config);
    setResults([]);
    setUserAddress("");
    setHasQueried(false);

    if (ethers.utils.isAddress(userAddress)) {
      setIsLoading(true);
      // const data = await alchemy.core.getTokenBalances(_address);
      // setResults(data);
    } else if (userAddress.includes(".eth")) {
      const _address = await alchemy.core.resolveName(userAddress);
      console.log(_address);
      setUserAddress(_address);
      setIsLoading(true);
      const data = await alchemy.core.getTokenBalances(_address);
      setResults(data);
      console.log(data);
    } else {
      alert("CLOUD SAYS ENTER A VALID ADDRESS!");
    }

    const data = await alchemy.core.getTokenBalances(userAddress);
    console.log(data);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
    setIsLoading(false);
  }

  return (
    <>
      <Box align="right">
        <Button
          margin={30}
          justifyContent={"flex-end"}
          fontSize={20}
          onClick={connectwalletHandler}
          mt={36}
          bgColor="orange"
        >
          Connect MetaMask
        </Button>
      </Box>
      <Box w="100vw" h="100vw">
        <Center>
          <Flex
            alignItems={"center"}
            justifyContent="center"
            flexDirection={"column"}
          >
            <Heading mb={0} fontSize={36}>
              ERC-20 Token Indexer
            </Heading>
            <Text>
              Plug in an address and this website will return all of its ERC-20
              token balances!
            </Text>
          </Flex>
        </Center>
        <Flex
          w="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent={"center"}
        >
          <Heading mt={42}>
            Get all the ERC-20 token balances of this address:
          </Heading>
          <Input
            onChange={(e) => setUserAddress(e.target.value)}
            color="black"
            w="600px"
            textAlign="center"
            p={4}
            bgColor="white"
            fontSize={24}
            placeholder={userAddress != "" ? userAddress : "CLOUD WAS HERE"}
            value={userAddress}
          />
          <Button
            fontSize={20}
            onClick={getTokenBalance}
            mt={36}
            bgColor="blue"
          >
            Check ERC-20 Token Balances
          </Button>
          <Heading my={36}>ERC-20 token balances:</Heading>

          {hasQueried ? (
            <SimpleGrid w={"90vw"} columns={4} spacing={24}>
              {results.tokenBalances.map((e, i) => {
                return (
                  <Flex
                    flexDir={"column"}
                    color="black"
                    bg="lightblue"
                    w={"20vw"}
                    key={e.id}
                    borderRadius={"30px"}
                    justifyItems={"center"}
                  >
                    <Image
                      style={{ height: "100px", width: "100px" }}
                      src={
                        tokenDataObjects[i].logo
                          ? tokenDataObjects[i].logo
                          : "images/download.png"
                      }
                    />

                    <Card>
                      <Heading size="md" textAlign="center">
                        Symbol:${tokenDataObjects[i].symbol}
                      </Heading>
                    </Card>
                    <Card>
                      <Heading size="md" textAlign="center">
                        Balance:
                        {Utils.formatUnits(
                          e.tokenBalance,
                          tokenDataObjects[i].decimals
                        ).substring(0, 8)}
                      </Heading>
                    </Card>
                  </Flex>
                );
              })}
            </SimpleGrid>
          ) : (
            ""
          )}
          {isLoading
            ? "LOADING....."
            : hasQueried
            ? ""
            : "Please make a query! This may take a few seconds..."}
        </Flex>
      </Box>
    </>
  );
}

export default App;
