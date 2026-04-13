import argparse
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.evals.mining_eval import render_report_markdown, run_mining_eval


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the mining evaluation harness.")
    parser.add_argument(
        "--case",
        action="append",
        dest="cases",
        help="Limit the run to one or more named eval cases.",
    )
    parser.add_argument(
        "--model",
        default="gpt-5-nano",
        help="Model to use for live generation.",
    )
    parser.add_argument(
        "--output",
        default=str(Path("..") / "output" / "mining-eval.json"),
        help="Where to save the JSON report.",
    )
    args = parser.parse_args()

    report = run_mining_eval(
        case_names=args.cases,
        model=args.model,
        output_path=args.output,
    )
    print(render_report_markdown(report))
    print(f"\nSaved JSON report to {args.output}")


if __name__ == "__main__":
    main()
