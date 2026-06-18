from typing import Optional, TypedDict


class VoteData(TypedDict):
    character: str
    series: str
    votes: list[Optional[float]]


class VotesByRoundsResult(TypedDict):
    votes_data: list[VoteData]
    vote_rounds: list[str]
    participating_counts: dict[str, int]


class CharacterInfo(TypedDict, total=False):
    character: str
    ip: str
    avatar: str
    id: Optional[str]
    rank: Optional[int]
    name_en: str
    cv: list[str]
    ip_id: Optional[str]
    ip_year: Optional[int]
    ip_season: Optional[str]
