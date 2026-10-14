import { PeopleListLoading } from "@/components/people/PeopleListLoading";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";

export default function ProfessionalsLoading() {
  return <PeopleListLoading kind={PEOPLE_KINDS.PROFESSIONAL} />;
}
