import {
  TableContainer,
  TableCaption,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Box,
  Stack,
  Button,
  Text,
  Badge,
  useDisclosure,
  Spinner as SP,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { Dialog } from "../../components/Modal";
import ServerForm from "../../components/ServerForm";
import {
  getAllServerAction,
  selectDeleteRequest,
} from "../../store/stress/server/actions";
import { Server } from "../../store/stress/server/types";

import { getServerList } from "../../store/stress/server/selectors";
import Spinner from "../../components/Spinner";
import { DeleteDialog } from "./DeleteRequest";

const pagination = {
  limit: 10,
  page: 1,
};
const TableHeader = [
  "Server Alias",
  "Description",
  "IP",
  "Token",
  "Last Update",
  "Active",
  "Action",
];

function TableBody({
  server,
  copy,
  onCopy,
}: {
  server: Server;
  copy: string;
  onCopy: (val: string) => void;
}) {
  const {
    id,
    alias,
    description,
    ip,
    updated_at: updatedAt,
    active,
    port,
    token,
  } = server;
  const dispatch = useDispatch();

  return (
    <motion.tr key={id} layout transition={{ duration: 0.5 }}>
      <Td>{alias}</Td>
      <Td>{description}</Td>
      <Td>{ip ? `${ip}:${port}` : "Not connected"}</Td>
      <Td
        cursor="pointer"
        color={copy === token ? "green" : ""}
        onClick={() => onCopy(token)}
      >
        {token} {copy === token ? <CheckIcon /> : <CopyIcon />}
      </Td>
      <Td>{format(updatedAt * 1000, "dd, MMM, Y, HH:MM")}</Td>
      <Td>
        <Badge colorScheme={active ? "green" : "red"}>
          {active ? "Connected" : "Disconnected"}
        </Badge>
      </Td>
      <Td>
        <Stack direction="row" display="flex" alignContent="center">
          <DeleteIcon
            cursor="pointer"
            onClick={() => dispatch(selectDeleteRequest(server))}
          />
          <EditIcon cursor="pointer" />
        </Stack>
      </Td>
    </motion.tr>
  );
}

export default function ServerBoard() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loading, data } = useSelector(getServerList);
  const [copy, setCopy] = useState<string>("");

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllServerAction(pagination));
  }, []);

  const onCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopy(() => text);
  };

  if (loading && !data?.data) {
    return <Spinner />;
  }
  return (
    <Box w="100%" bg="white" h="calc(100vh - 65px)" p={10}>
      <Dialog isOpen={isOpen} onClose={onClose}>
        <ServerForm onClose={onClose} />
      </Dialog>
      <DeleteDialog />
      <TableContainer border="1px solid #f6f6f6">
        <Stack
          width="100%"
          direction="row"
          justifyContent="space-between"
          alignItems="Center"
          padding={3}
        >
          <Text fontSize="1xl" fontWeight="bold">
            Server Details
          </Text>
          <Button onClick={onOpen}>Add New Server</Button>
        </Stack>
        <Table variant="simple">
          <Thead>
            <Tr>
              {TableHeader.map((item) => (
                <Th>{item}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {loading && (
              <TableCaption>
                <SP />
              </TableCaption>
            )}
            {data?.data?.map((server) => (
              <TableBody server={server} copy={copy} onCopy={onCopy} />
            ))}
          </Tbody>
        </Table>
        <Stack
          direction="row"
          w="100%"
          height="60px"
          bg="white"
          justifyContent="center"
          align="center"
        >
          <Button colorScheme="blue">Prev</Button>
          <Button colorScheme="blue">Next</Button>
        </Stack>
      </TableContainer>
    </Box>
  );
}
