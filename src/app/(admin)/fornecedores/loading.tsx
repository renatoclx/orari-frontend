import { PeopleListLoading } from "@/components/people/PeopleListLoading";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";

export default function SuppliersLoading() {
  return <PeopleListLoading kind={PEOPLE_KINDS.SUPPLIER} />;
}
