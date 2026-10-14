import { PeopleListLoading } from "@/components/people/PeopleListLoading";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";

export default function ClientsLoading() {
  return <PeopleListLoading kind={PEOPLE_KINDS.CLIENT} />;
}
