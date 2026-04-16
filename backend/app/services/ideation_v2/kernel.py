from pydantic import BaseModel

from app.services.ideation_v2.types import NormalizedSeed


class KernelCandidate(BaseModel):
    text: str
    primary_actor: str
    primary_tension: str
    primary_outcome: str
    primary_environment: str | None
    confidence: float


class KernelSet(BaseModel):
    primary_kernel: KernelCandidate
    alternate_kernel: KernelCandidate | None = None


def build_kernel_set(seed: NormalizedSeed) -> KernelSet:
    actor = seed.actors[0] if seed.actors else "user"
    tension = seed.tensions[0] if seed.tensions else "friction"
    outcome = seed.outcomes[0] if seed.outcomes else "better result"
    environment = seed.environments[0] if seed.environments else None
    text = f"A {actor} wants {outcome} by addressing {tension}"
    if environment:
        text = f"{text} in {environment}"

    primary = KernelCandidate(
        text=text,
        primary_actor=actor,
        primary_tension=tension,
        primary_outcome=outcome,
        primary_environment=environment,
        confidence=0.8,
    )
    return KernelSet(primary_kernel=primary)
